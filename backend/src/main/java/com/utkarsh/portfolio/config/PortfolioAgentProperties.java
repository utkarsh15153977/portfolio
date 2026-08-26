package com.utkarsh.portfolio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Phase 4.5 — feature flag for agent orchestration.
 *
 * Bound from application.yml, which reads the PORTFOLIO_AI_AGENT_ENABLED
 * environment variable with a hard default of {@code false}: enabling the
 * agent must always be an explicit decision, and the existing RAG chat
 * behavior must never change by accident.
 *
 * When disabled, PortfolioAgentService is not reachable through any endpoint;
 * the plain RAG chat path keeps serving /api/ai/chat unchanged.
 */
@ConfigurationProperties(prefix = "portfolio.ai.agent")
public record PortfolioAgentProperties(boolean enabled) {
}
