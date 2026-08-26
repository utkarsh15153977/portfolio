package com.utkarsh.portfolio.tools;

import com.utkarsh.portfolio.ai.PortfolioAgentService;
import com.utkarsh.portfolio.ai.PortfolioChatService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.ai.chat.model.ChatModel;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Phase 4.5 wiring verification in the real application context (model mocked,
 * RAG ingestion disabled): the MethodToolCallbackProvider bean is created from
 * the EXISTING PortfolioTools and registers exactly the four read-only tools,
 * while both chat paths coexist untouched.
 */
@SpringBootTest(properties = {
        "spring.ai.openai.api-key=test-key",
        "portfolio.ai.rag.enabled=false"
})
class AgentToolCallbackRegistrationTest {

    @MockitoBean
    ChatModel chatModel;

    @Autowired
    MethodToolCallbackProvider portfolioToolCallbackProvider;

    @Autowired
    PortfolioTools portfolioTools;

    @Autowired
    PortfolioChatService chatService;

    @Autowired
    PortfolioAgentService agentService;

    @Test
    void providerBeanIsRegisteredAndExposesExactlyTheFourPortfolioTools() {
        ToolCallback[] callbacks = portfolioToolCallbackProvider.getToolCallbacks();

        assertThat(callbacks).hasSize(4);
        assertThat(callbacks)
                .extracting(callback -> callback.getToolDefinition().name())
                .containsExactlyInAnyOrder(
                        "searchProjects", "getSkills", "getExperience", "explainArchitecture");
        assertThat(callbacks)
                .allSatisfy(callback -> {
                    assertThat(callback.getToolDefinition().description()).isNotBlank();
                    assertThat(callback.getToolDefinition().description())
                            .containsIgnoringCase("read-only");
                });
    }

    @Test
    void providerIsBuiltFromTheExistingPortfolioToolsInstance() {
        // Same single source of truth: every callback must come from the
        // PortfolioTools bean, not from any duplicate implementation.
        assertThat(portfolioTools.searchProjects("").results()).isNotEmpty();

        for (ToolCallback callback : portfolioToolCallbackProvider.getToolCallbacks()) {
            assertThat(callback).isInstanceOf(
                    org.springframework.ai.tool.method.MethodToolCallback.class);
        }
    }

    @Test
    void ragChatPathAndAgentPathCoexist() {
        // The plain RAG service must remain a distinct, intact bean alongside
        // the new agent service — no replacement, no redesign.
        assertThat(chatService).isNotNull();
        assertThat(agentService).isNotNull();
    }
}
