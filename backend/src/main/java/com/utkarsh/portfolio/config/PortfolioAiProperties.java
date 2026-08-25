package com.utkarsh.portfolio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed configuration for the portfolio AI endpoint.
 *
 * Values come from application.yml, which in turn reads environment variables —
 * no secrets are ever hardcoded here.
 *
 * Phase 4.1 keeps this intentionally small: a system prompt that grounds the
 * model in honest portfolio content and the label used as the response source.
 * Later phases (RAG, vector store, tools, agents) extend this class instead of
 * introducing parallel configuration.
 */
@ConfigurationProperties(prefix = "portfolio.ai")
public record PortfolioAiProperties(String systemPrompt, String responseSource) {

    public PortfolioAiProperties {
        if (responseSource == null || responseSource.isBlank()) {
            responseSource = "portfolio";
        }
    }
}
