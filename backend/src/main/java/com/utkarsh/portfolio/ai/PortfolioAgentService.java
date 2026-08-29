package com.utkarsh.portfolio.ai;

import com.utkarsh.portfolio.config.PortfolioAiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.execution.ToolExecutionException;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.lang.NonNull;
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

    public PortfolioAgentService(@NonNull ChatClient chatClient,
                                 @NonNull PortfolioAiProperties properties,
                                 @NonNull MethodToolCallbackProvider portfolioToolCallbackProvider) {
        // Add null checks for all dependencies
        if (chatClient == null) {
            throw new IllegalArgumentException("ChatClient must not be null");
        }
        if (properties == null) {
            throw new IllegalArgumentException("PortfolioAiProperties must not be null");
        }
        if (portfolioToolCallbackProvider == null) {
            throw new IllegalArgumentException("MethodToolCallbackProvider must not be null");
        }
        
        this.chatClient = chatClient;
        this.baseSystemPrompt = properties.systemPrompt();
        this.toolCallbackProvider = portfolioToolCallbackProvider;
    }

    /**
     * Process a user message through the AI agent with tool calling capabilities.
     *
     * @param message The user's message/question (must not be null or blank)
     * @return The AI agent's response
     * @throws IllegalArgumentException if message is null or blank
     * @throws ToolExecutionException if a tool execution fails
     * @throws RuntimeException for other unexpected errors
     */
    public String answer(@NonNull String message) {
        // Enhanced null/blank check with detailed error message
        if (message == null) {
            throw new IllegalArgumentException("message must not be null");
        }
        if (message.isBlank()) {
            throw new IllegalArgumentException("message must not be blank");
        }
        
        long startedAt = System.nanoTime();
        
        // Phase 4.7 observability: durations and outcomes only — the message
        // content is never logged.
        int toolCount = toolCallbackProvider.getToolCallbacks() != null 
                ? toolCallbackProvider.getToolCallbacks().length 
                : 0;
        log.info("Agent request started (chars={}, tools={})",
                message.length(), toolCount);
        
        try {
            // Safely build the system prompt with null handling
            String systemPrompt = buildSystemPrompt();
            
            String answer = chatClient.prompt()
                    .system(systemPrompt)
                    // Attaches the registered provider bean itself; Spring AI 1.1.8
                    // resolves its callbacks at request time.
                    .toolCallbacks(toolCallbackProvider)
                    .user(message.strip())
                    .call()
                    .content();
            
            // Handle null response gracefully
            if (answer == null) {
                log.warn("Agent returned null response");
                return "I apologize, but I couldn't generate a response. Please try again.";
            }
            
            log.info("Agent request completed ok in {} ms (answerChars={})",
                    (System.nanoTime() - startedAt) / 1_000_000,
                    answer.length());
            return answer;
            
        } catch (ToolExecutionException e) {
            // Safer logging with null checks
            String toolName = e.getToolDefinition() != null 
                    ? e.getToolDefinition().name() 
                    : "unknown";
            log.warn("Agent tool execution failed after {} ms (tool={})",
                    (System.nanoTime() - startedAt) / 1_000_000,
                    toolName);
            // FIX: Correct constructor - ToolExecutionException only takes a message
            // The original exception is already a ToolExecutionException, so we just rethrow it
            throw e;
            
        } catch (RuntimeException e) {
            // Class name only — exception messages may contain provider details.
            log.warn("Agent request failed after {} ms: {}",
                    (System.nanoTime() - startedAt) / 1_000_000, 
                    e.getClass().getSimpleName());
            throw e;
        }
    }

    /**
     * Build the complete system prompt by combining base prompt with agent rules.
     * Includes null safety for the base prompt.
     *
     * @return The complete system prompt
     */
    private String buildSystemPrompt() {
        String base = baseSystemPrompt;
        if (base == null) {
            base = "You are a helpful portfolio assistant for Utkarsh Singh.";
        }
        return base + "\n\n" + AGENT_RULES;
    }

    /**
     * Get the number of registered tools.
     * Useful for monitoring and debugging.
     *
     * @return The number of registered tool callbacks
     */
    public int getToolCount() {
        var callbacks = toolCallbackProvider.getToolCallbacks();
        return callbacks != null ? callbacks.length : 0;
    }

    /**
     * Check if the agent is properly initialized and ready to process requests.
     *
     * @return true if the agent is ready, false otherwise
     */
    public boolean isReady() {
        try {
            return chatClient != null 
                    && toolCallbackProvider != null 
                    && getToolCount() > 0;
        } catch (Exception e) {
            return false;
        }
    }
}