package com.utkarsh.portfolio.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for the provider-aware RAG properties: explicit provider
 * validation and embedding-dimension derivation (openai -> 1536,
 * ollama/nomic-embed-text -> 768). No Spring context needed.
 */
class PortfolioRagPropertiesTest {

    private static PortfolioRagProperties props(String provider, int dimensions) {
        return new PortfolioRagProperties(
                true, "file", provider, 4, 0.3, "./data/test-index.json", false,
                dimensions, "", "", "", "portfolio_knowledge");
    }

    @Test
    void defaultsToLocalOllamaProviderWithNomicDimensions() {
        PortfolioRagProperties properties = props(null, 0);

        assertThat(properties.provider()).isEqualTo("ollama");
        assertThat(properties.dimensions())
                .isEqualTo(PortfolioRagProperties.OLLAMA_EMBEDDING_DIMENSIONS)
                .isEqualTo(768);
        assertThat(properties.isOpenAi()).isFalse();
    }

    @Test
    void openaiProviderDerivesOpenAiDimensions() {
        PortfolioRagProperties properties = props("openai", 0);

        assertThat(properties.provider()).isEqualTo("openai");
        assertThat(properties.dimensions())
                .isEqualTo(PortfolioRagProperties.OPENAI_EMBEDDING_DIMENSIONS)
                .isEqualTo(1536);
        assertThat(properties.isOpenAi()).isTrue();
    }

    @Test
    void explicitDimensionOverrideWinsOverProviderDefault() {
        assertThat(props("ollama", 1536).dimensions()).isEqualTo(1536);
        assertThat(props("openai", 768).dimensions()).isEqualTo(768);
    }

    @Test
    void unknownProviderIsRejectedFast() {
        assertThatThrownBy(() -> props("azure", 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("'openai' or 'ollama'");
    }

    @Test
    void providerCaseIsNormalized() {
        assertThat(props("OpenAI", 0).provider()).isEqualTo("openai");
        assertThat(props(" OLLAMA ", 0).provider()).isEqualTo("ollama");
    }
}
