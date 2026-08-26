package com.utkarsh.portfolio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the portfolio knowledge / RAG layer (Phases 4.2 + 4.3).
 *
 * Everything is environment-driven via application.yml; no secrets here.
 *
 * store-type selects the vector-store backend:
 *  - "file"     (default) zero-infra local persistence via SimpleVectorStore,
 *               index + hash-state persisted under index-file.
 *  - "pgvector" production PostgreSQL + pgvector persistence; connection
 *               details come exclusively from environment variables.
 *
 * provider mirrors the model provider switch (PORTFOLIO_AI_PROVIDER,
 * default "ollama"). It is used ONLY to derive embedding defaults:
 *  - openai -> text-embedding-3-small, 1536 dimensions
 *  - ollama -> nomic-embed-text,       768 dimensions
 * It never selects or initializes models by itself.
 */
@ConfigurationProperties(prefix = "portfolio.ai.rag")
public record PortfolioRagProperties(
        boolean enabled,
        String storeType,
        String provider,
        int topK,
        double similarityThreshold,
        String indexFile,
        boolean rebuildOnStartup,
        int dimensions,
        String pgUrl,
        String pgUsername,
        String pgPassword,
        String pgTable) {

    /** Default embedding dimensions per supported provider. */
    public static final int OPENAI_EMBEDDING_DIMENSIONS = 1536;
    public static final int OLLAMA_EMBEDDING_DIMENSIONS = 768;

    public PortfolioRagProperties {
        if (storeType == null || storeType.isBlank()) {
            storeType = "file";
        }
        storeType = storeType.toLowerCase();
        if (!storeType.equals("file") && !storeType.equals("pgvector")) {
            throw new IllegalArgumentException(
                    "portfolio.ai.rag.store-type must be 'file' or 'pgvector', got: " + storeType);
        }
        if (provider == null || provider.isBlank()) {
            // Must match the application.yml provider default (local dev).
            provider = "ollama";
        }
        // NOTE: within a record's compact constructor only the PARAMETERS hold
        // values (fields are assigned afterwards), so normalization and
        // derivation below must use the local variable — never instance methods.
        provider = provider.strip().toLowerCase();
        if (!provider.equals("openai") && !provider.equals("ollama")) {
            throw new IllegalArgumentException(
                    "portfolio.ai.rag.provider must be 'openai' or 'ollama', got: " + provider);
        }
        if (topK <= 0) {
            topK = 4;
        }
        if (topK > 10) {
            topK = 10;
        }
        if (similarityThreshold <= 0 || similarityThreshold >= 1) {
            similarityThreshold = 0.3;
        }
        if (indexFile == null || indexFile.isBlank()) {
            indexFile = "./data/portfolio-index.json";
        }
        if (dimensions <= 0) {
            dimensions = "openai".equals(provider)
                    ? OPENAI_EMBEDDING_DIMENSIONS
                    : OLLAMA_EMBEDDING_DIMENSIONS;
        }
        if (pgUrl == null) {
            pgUrl = "";
        }
        if (pgUsername == null) {
            pgUsername = "";
        }
        if (pgPassword == null) {
            pgPassword = "";
        }
        if (pgTable == null || pgTable.isBlank()) {
            pgTable = "portfolio_knowledge";
        }
    }

    public boolean isPgVector() {
        return "pgvector".equals(storeType);
    }

    public boolean isOpenAi() {
        return "openai".equals(provider);
    }
}
