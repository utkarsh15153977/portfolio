package com.utkarsh.portfolio.ai;

import com.utkarsh.portfolio.config.PortfolioAiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.execution.ToolExecutionException;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.stereotype.Service;

/**
 * Phase 4.5 — agent orchestration on top of the existing ChatClient stack.
 *
 * user question
 *      ↓ ChatClient prompt with the registered read-only portfolio tools attached
 *      ↓ the MODEL autonomously decides whether a tool call is needed and which one
 *      ↓ Spring AI executes the tool round-trip(s) and feeds results back to the model
 *      ↓ final grounded answer
 *
 * Deliberate constraints:
 * - NO keyword routing: tool selection is left entirely to the model through
 *   Spring AI's function-calling protocol.
 * - NO duplicated tool logic: this service attaches the exact callbacks exposed
 *   by the {@link MethodToolCallbackProvider} bean built from
 *   {@link com.utkarsh.portfolio.tools.PortfolioTools} (Phase 4.4).
 * - The plain RAG chat path ({@link PortfolioChatService}) is untouched; both
 *   services coexist behind separate endpoints.
 *
 * Note on API shape: in Spring AI 1.1.8, ChatClientRequestSpec.tools(Object...)
 * expects raw annotated tool objects, while toolCallbacks(ToolCallbackProvider...)
 * attaches an already-registered provider. The latter is used here so the
 * registered bean remains the single source of tool definitions.
 */
@Service
public class PortfolioAgentService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioAgentService.class);

    /**
     * Agent-specific operating rules layered on top of the portfolio honesty
     * system prompt (which already separates production experience from AI
     * exploration / future direction).
     */
    static final String AGENT_RULES = """
            AGENT OPERATING RULES:
            1. You have read-only tools that query Utkarsh's real portfolio data \
            (searchProjects, getSkills, getExperience, explainArchitecture). \
            Call them whenever portfolio details are needed.
            2. Prefer tool results over memory or guessing; quote only what the \
            tools return.
            3. Never invent employers, projects, metrics, credentials, \
            technologies or experience — with or without tools.
            4. If no tool returns the requested information, state clearly that \
            it is not available in the portfolio.
            5. Keep answers concise and technical.""";

    private final ChatClient chatClient;
    private final String baseSystemPrompt;
    private final MethodToolCallbackProvider toolCallbackProvider;

    public PortfolioAgentService(ChatClient chatClient,
                                 PortfolioAiProperties properties,
                                 MethodToolCallbackProvider portfolioToolCallbackProvider) {
        this.chatClient = chatClient;
        this.baseSystemPrompt = properties.systemPrompt();
        this.toolCallbackProvider = portfolioToolCallbackProvider;
    }

    public String answer(String message) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message must not be blank");
        }
        long startedAt = System.nanoTime();
        // Phase 4.7 observability: durations and outcomes only — the message
        // content is never logged.
        log.info("Agent request started (chars={}, tools={})",
                message.length(), toolCallbackProvider.getToolCallbacks().length);
        try {
            String answer = chatClient.prompt()
                    .system(baseSystemPrompt + "\n\n" + AGENT_RULES)
                    // Attaches the registered provider bean itself; Spring AI 1.1.8
                    // resolves its callbacks at request time.
                    .toolCallbacks(toolCallbackProvider)
                    .user(message.strip())
                    .call()
                    .content();
            log.info("Agent request completed ok in {} ms (answerChars={})",
                    (System.nanoTime() - startedAt) / 1_000_000,
                    answer == null ? 0 : answer.length());
            return answer;
        } catch (ToolExecutionException e) {
            log.warn("Agent tool execution failed after {} ms (tool={})",
                    (System.nanoTime() - startedAt) / 1_000_000,
                    e.getToolDefinition().name());
            throw e;
        } catch (RuntimeException e) {
            // Class name only — exception messages may contain provider details.
            log.warn("Agent request failed after {} ms: {}",
                    (System.nanoTime() - startedAt) / 1_000_000, e.getClass().getSimpleName());
            throw e;
        }
    }
}
