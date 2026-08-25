package com.utkarsh.portfolio.knowledge;

import com.utkarsh.portfolio.config.PortfolioRagProperties;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.MapConfigurationPropertySource;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Phase 4.3 configuration tests: typed property binding for the new
 * store-type / pgvector settings and backend bean selection per configuration.
 */
class RagConfigurationTest {

    private PortfolioRagProperties bind(Map<String, String> values) {
        var source = new MapConfigurationPropertySource(values);
        return new Binder(source)
                .bind("portfolio.ai.rag", Bindable.of(PortfolioRagProperties.class))
                .get();
    }

    @Test
    void defaultsSelectFileBackend() {
        PortfolioRagProperties props = bind(Map.of("portfolio.ai.rag.enabled", "true"));
        assertThat(props.storeType()).isEqualTo("file");
        assertThat(props.isPgVector()).isFalse();
        assertThat(props.dimensions()).isEqualTo(1536);
        assertThat(props.pgTable()).isEqualTo("portfolio_knowledge");
    }

    @Test
    void pgVectorBindingReadsEnvironmentStyleValues() {
        PortfolioRagProperties props = bind(Map.ofEntries(
                Map.entry("portfolio.ai.rag.store-type", "pgvector"),
                Map.entry("portfolio.ai.rag.pg-url", "jdbc:postgresql://db:5432/portfolio_ai"),
                Map.entry("portfolio.ai.rag.pg-username", "portfolio_ai"),
                Map.entry("portfolio.ai.rag.pg-password", "secret"),
                Map.entry("portfolio.ai.rag.dimensions", "1536")));

        assertThat(props.isPgVector()).isTrue();
        assertThat(props.pgUrl()).isEqualTo("jdbc:postgresql://db:5432/portfolio_ai");
        assertThat(props.pgUsername()).isEqualTo("portfolio_ai");
        assertThat(props.pgPassword()).isEqualTo("secret");
    }

    @Test
    void unknownStoreTypeIsRejected() {
        assertThatThrownBy(() -> bind(Map.of("portfolio.ai.rag.store-type", "redis")))
                .isInstanceOf(Exception.class);
    }

    @org.junit.jupiter.api.Test
    void fileBackendSelectedByDefault_pgVectorBackendNotCreatedInFileMode() {
        var runner = new org.springframework.boot.test.context.runner.ApplicationContextRunner()
                .withBean(org.springframework.ai.embedding.EmbeddingModel.class, FakeHashEmbedder::new);

        runner.withUserConfiguration(com.utkarsh.portfolio.config.RagConfig.class).run(context -> {
            assertThat(context).hasSingleBean(SimpleVectorStore.class);
        });

        runner.withUserConfiguration(com.utkarsh.portfolio.config.RagConfig.class)
                .withPropertyValues("portfolio.ai.rag.store-type=pgvector")
                .run(context -> {
                    assertThat(context).doesNotHaveBean(SimpleVectorStore.class);
                    assertThat(context).doesNotHaveBean("vectorStore");
                });
    }
}
