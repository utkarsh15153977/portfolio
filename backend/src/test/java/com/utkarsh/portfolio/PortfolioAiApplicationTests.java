package com.utkarsh.portfolio;

import com.utkarsh.portfolio.ai.PortfolioChatService;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.ai.chat.model.ChatModel;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Boots the full context with the chat model mocked and RAG disabled —
 * verifies Phase 4.2 wiring (properties, ChatClient, knowledge loader, chat
 * service, controller) without any network access or embedding calls.
 */
@SpringBootTest(properties = {
        "spring.ai.openai.api-key=test-key",
        "portfolio.ai.rag.enabled=false"
})
class PortfolioAiApplicationTests {

    @MockitoBean
    ChatModel chatModel;

    @Autowired
    PortfolioChatService chatService;

    @Autowired
    PortfolioKnowledgeLoader knowledgeLoader;

    @Test
    void contextLoadsWithMockedModelAndKnowledgeAvailable() {
        assertThat(chatService).isNotNull();
        assertThat(knowledgeLoader.loadAll()).isNotEmpty();
    }
}
