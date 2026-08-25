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
 */
@ConfigurationProperties(prefix = "portfolio.ai.rag")
public record PortfolioRagProperties(
        boolean enabled,
        String storeType,
        int topK,
        double similarityThreshold,
        String indexFile,
        boolean rebuildOnStartup,
        int dimensions,
        String pgUrl,
        String pgUsername,
        String pgPassword,
        String pgTable) {

    public PortfolioRagProperties {
        if (storeType == null || storeType.isBlank()) {
            storeType = "file";
        }
        storeType = storeType.toLowerCase();
        if (!storeType.equals("file") && !storeType.equals("pgvector")) {
            throw new IllegalArgumentException(
                    "portfolio.ai.rag.store-type must be 'file' or 'pgvector', got: " + storeType);
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
            dimensions = 1536;
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
}
