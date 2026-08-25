package com.utkarsh.portfolio.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Phase 4.3 production vector-store wiring: PostgreSQL + pgvector.
 *
 * Activated only when portfolio.ai.rag.store-type=pgvector. The DataSource is
 * constructed manually from environment-driven properties (Spring's
 * DataSourceAutoConfiguration is excluded in application.yml) so that the
 * zero-infra file mode never accidentally demands database configuration.
 *
 * Schema (table + HNSW index) is created by PgVectorStore itself via
 * initializeSchema(true). The pgvector EXTENSION must already be installed on
 * the target database (CREATE EXTENSION vector;) — documented in README.
 *
 * Credentials arrive exclusively through environment variables; nothing is
 * hardcoded and nothing is exposed to the frontend.
 */
@Configuration
@Conditional(RagStoreConditions.PgVector.class)
public class PgVectorStoreConfig {

    @Bean
    public HikariDataSource portfolioVectorDataSource(PortfolioRagProperties properties) {
        if (properties.pgUrl().isBlank() || properties.pgUsername().isBlank()) {
            throw new IllegalStateException(
                    "store-type=pgvector requires PORTFOLIO_AI_PGVECTOR_URL and "
                            + "PORTFOLIO_AI_PGVECTOR_USERNAME (and password) environment variables");
        }
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(properties.pgUrl());
        config.setUsername(properties.pgUsername());
        config.setPassword(properties.pgPassword());
        config.setMaximumPoolSize(4);
        config.setPoolName("portfolio-vector-pool");
        config.setConnectionTimeout(10_000);
        config.setInitializationFailTimeout(10_000);
        return new HikariDataSource(config);
    }

    @Bean
    public JdbcTemplate portfolioVectorJdbcTemplate(HikariDataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean
    public VectorStore vectorStore(JdbcTemplate jdbcTemplate,
                                   EmbeddingModel embeddingModel,
                                   PortfolioRagProperties properties) {
        return PgVectorStore.builder(jdbcTemplate, embeddingModel)
                .dimensions(properties.dimensions())
                .vectorTableName(properties.pgTable())
                .initializeSchema(true)
                .build();
    }
}
