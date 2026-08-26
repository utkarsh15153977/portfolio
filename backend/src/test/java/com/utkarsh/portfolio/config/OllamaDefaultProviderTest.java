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
 * Phase 4.4 provider-switch verification — DEFAULT state.
 *
 * Boots the full application context exactly as a local developer would
 * (no PORTFOLIO_AI_PROVIDER set, no API key, RAG ingestion disabled so no
 * embedding calls are attempted). Asserts that:
 *  - startup does NOT require SPRING_AI_OPENAI_API_KEY,
 *  - Ollama is the active chat + embedding provider,
 *  - OpenAI auto-configuration is fully excluded (no beans, no init).
 */
@SpringBootTest(properties = "portfolio.ai.rag.enabled=false")
class OllamaDefaultProviderTest {

    @Autowired
    ApplicationContext context;

    @Autowired
    PortfolioRagProperties ragProperties;

    @Test
    void ollamaIsActiveAndOpenAiIsCompletelyAbsent() {
        assertThat(context.getBean(ChatModel.class)).isInstanceOf(OllamaChatModel.class);
        assertThat(context.getBean(EmbeddingModel.class)).isInstanceOf(OllamaEmbeddingModel.class);

        // The losing provider must not be initialized at all.
        assertThat(context.getBeansOfType(OpenAiChatModel.class)).isEmpty();
        assertThat(context.getBeansOfType(OpenAiEmbeddingModel.class)).isEmpty();
    }

    @Test
    void localDefaultsUseNomicEmbeddingDimensions() {
        assertThat(ragProperties.provider()).isEqualTo("ollama");
        assertThat(ragProperties.dimensions()).isEqualTo(768);
    }
}
