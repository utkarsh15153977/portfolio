package com.utkarsh.portfolio.config;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.OllamaEmbeddingModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Phase 4.4 provider-switch verification — explicit OPENAI selection.
 *
 * Setting the provider switch to openai (as a production deployment would)
 * must flip BOTH model stacks to OpenAI and exclude every Ollama bean, proving
 * the selection is exclusive in both directions.
 */
@SpringBootTest(properties = {
        "spring.ai.model.chat=openai",
        "spring.ai.model.embedding=openai",
        "portfolio.ai.rag.provider=openai",
        "spring.ai.openai.api-key=test-key",
        "portfolio.ai.rag.enabled=false"
})
class ExplicitOpenAiProviderSwitchTest {

    @Autowired
    ApplicationContext context;

    @Autowired
    PortfolioRagProperties ragProperties;

    @Test
    void openaiIsActiveAndOllamaIsCompletelyAbsent() {
        assertThat(context.getBean(ChatModel.class)).isInstanceOf(OpenAiChatModel.class);
        assertThat(context.getBean(EmbeddingModel.class)).isInstanceOf(OpenAiEmbeddingModel.class);

        assertThat(context.getBeansOfType(OllamaChatModel.class)).isEmpty();
        assertThat(context.getBeansOfType(OllamaEmbeddingModel.class)).isEmpty();
    }

    @Test
    void openaiEmbeddingDimensionsApply() {
        assertThat(ragProperties.provider()).isEqualTo("openai");
        assertThat(ragProperties.dimensions()).isEqualTo(1536);
    }
}
