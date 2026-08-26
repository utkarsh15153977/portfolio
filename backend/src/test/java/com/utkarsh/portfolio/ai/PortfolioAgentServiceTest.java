package com.utkarsh.portfolio.ai;

import com.utkarsh.portfolio.config.PortfolioAiProperties;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import com.utkarsh.portfolio.tools.PortfolioTools;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.execution.ToolExecutionException;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Phase 4.5 agent service tests.
 *
 * The ChatClient fluent API is mocked; the REAL PortfolioTools + provider are
 * used so the tests prove the agent attaches exactly the four registered
 * read-only portfolio tools to every request — no keyword routing, no tool
 * duplication. Provider and tool failures must propagate for safe mapping in
 * GlobalExceptionHandler.
 */
class PortfolioAgentServiceTest {

    /** Mirrors the honest base system prompt configured in application.yml. */
    private static final String BASE_PROMPT =
            """
            You are UTKARSH AI, an assistant embedded in Utkarsh Singh's developer \
            portfolio. Answer ONLY from the facts below and stay strictly honest.

            PRODUCTION EXPERIENCE (real, professional): Java, Spring Boot, REST APIs, \
            microservices, Kafka, PostgreSQL optimization, Redis caching, AWS, Docker.

            Employer: EdgeVerve Systems (An Infosys Company), Product Developer, Bangalore.

            AI TOPICS (LLMs, RAG, AI agents, agentic systems, Spring AI): these are \
            EXPLORATION and FUTURE DIRECTION only. Never describe them as production \
            experience or professional work.

            RULES: Do not invent employers, metrics, projects or credentials.""";

    private ChatClient.ChatClientRequestSpec requestSpec;
    private ChatClient.CallResponseSpec callSpec;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setUpFluentMocks() {
        requestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        callSpec = mock(ChatClient.CallResponseSpec.class);

        //noinspection unchecked
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.toolCallbacks(any(ToolCallbackProvider.class))).thenReturn(requestSpec);
        //noinspection unchecked
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callSpec);
    }

    private ChatClient mockChatClient() {
        ChatClient chatClient = mock(ChatClient.class);
        when(chatClient.prompt()).thenReturn(requestSpec);
        return chatClient;
    }

    /** The real registration path: existing tools -> MethodToolCallbackProvider bean. */
    private MethodToolCallbackProvider realProvider() {
        return MethodToolCallbackProvider.builder()
                .toolObjects(new PortfolioTools(new PortfolioKnowledgeLoader()))
                .build();
    }

    private PortfolioAgentService newService() {
        return new PortfolioAgentService(mockChatClient(), new PortfolioAiProperties(BASE_PROMPT, "portfolio"),
                realProvider());
    }

    @Test
    void attachesExactlyTheFourRegisteredPortfolioToolsToEveryRequest() {
        when(callSpec.content()).thenReturn("ok");

        newService().answer("What technologies did Utkarsh use at EdgeVerve?");

        var captor = org.mockito.ArgumentCaptor.forClass(ToolCallbackProvider.class);
        verify(requestSpec).toolCallbacks(captor.capture());

        ToolCallback[] attached = captor.getValue().getToolCallbacks();
        assertThat(attached).hasSize(4);
        assertThat(attached)
                .extracting(callback -> callback.getToolDefinition().name())
                .containsExactlyInAnyOrder(
                        "searchProjects", "getSkills", "getExperience", "explainArchitecture");
    }

    @Test
    void systemPromptPreservesHonestyRulesAndAddsAgentRules() {
        when(callSpec.content()).thenReturn("He used Java and Spring Boot at EdgeVerve.");

        String answer = newService().answer("What technologies did Utkarsh use at EdgeVerve?");

        assertThat(answer).isEqualTo("He used Java and Spring Boot at EdgeVerve.");

        var systemCaptor = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(requestSpec).system(systemCaptor.capture());
        String system = systemCaptor.getValue();

        assertThat(system)
                .startsWith(BASE_PROMPT)
                .contains("Never describe them as production")
                .contains("Do not invent employers")
                .contains(PortfolioAgentService.AGENT_RULES)
                .contains("searchProjects")
                .contains("Prefer tool results over memory or guessing")
                .contains("not available in the portfolio");

        verify(requestSpec).user("What technologies did Utkarsh use at EdgeVerve?");
    }

    @Test
    void blankMessageIsRejectedBeforeAnyModelCall() {
        assertThatThrownBy(() -> newService().answer("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must not be blank");

        assertThatThrownBy(() -> newService().answer(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void userMessageIsTrimmedButNotOtherwiseModified() {
        when(callSpec.content()).thenReturn("ok");

        newService().answer("  What are his production skills?  ");

        verify(requestSpec).user("What are his production skills?");
    }

    @Test
    void llmFailurePropagatesForSafeMapping() {
        when(requestSpec.call()).thenThrow(new NonTransientAiException("provider down"));

        assertThatThrownBy(() -> newService().answer("hi"))
                .isInstanceOf(NonTransientAiException.class);
    }

    @Test
    void toolExecutionFailurePropagatesForSafeMapping() {
        ToolCallback failing = realProvider().getToolCallbacks()[0];
        when(requestSpec.call()).thenThrow(
                new ToolExecutionException(failing.getToolDefinition(), new RuntimeException("tool blew up")));

        assertThatThrownBy(() -> newService().answer("hi"))
                .isInstanceOf(ToolExecutionException.class);
    }
}
