package com.utkarsh.portfolio.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;

/**
 * Phase 4.2 file-backed vector-store wiring — the default zero-infra mode.
 *
 * An in-process {@link SimpleVectorStore} over the provider-configured
 * {@link EmbeddingModel}; vectors + hash state are persisted to disk by
 * PortfolioIndexInitializer with incremental reconciliation (Phase 4.3).
 *
 * Production deployments should set
 * PORTFOLIO_AI_RAG_STORE_TYPE=pgvector to activate PgVectorStoreConfig instead.
 */
@Configuration
@Conditional(RagStoreConditions.File.class)
public class RagConfig {

    @Bean
    public SimpleVectorStore vectorStore(EmbeddingModel embeddingModel) {
        return SimpleVectorStore.builder(embeddingModel).build();
    }
}
