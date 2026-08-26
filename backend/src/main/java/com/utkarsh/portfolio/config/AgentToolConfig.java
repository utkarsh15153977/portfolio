package com.utkarsh.portfolio.config;

import com.utkarsh.portfolio.tools.PortfolioTools;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Phase 4.5 — the single registration point for portfolio tools.
 *
 * Builds one {@link MethodToolCallbackProvider} from the existing
 * {@link PortfolioTools} component (the Phase 4.4 single source of truth), so
 * the agent attaches exactly those four read-only callbacks — no duplicated
 * or replacement tool logic anywhere in the codebase.
 *
 * The bean is registered unconditionally: building it performs no model or
 * provider calls, and it stays inert unless PortfolioAgentService attaches it
 * to a request. This keeps tests able to verify registration regardless of
 * the PORTFOLIO_AI_AGENT_ENABLED flag.
 */
@Configuration
public class AgentToolConfig {

    @Bean
    public MethodToolCallbackProvider portfolioToolCallbackProvider(PortfolioTools tools) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(tools)
                .build();
    }
}
