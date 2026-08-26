package com.utkarsh.portfolio.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Phase 4.5 feature-flag binding tests.
 *
 * The default MUST be disabled so existing chat behavior never changes by
 * accident, and PORTFOLIO_AI_AGENT_ENABLED must be able to enable it —
 * exactly as application.yml maps it:
 * {@code portfolio.ai.agent.enabled: ${PORTFOLIO_AI_AGENT_ENABLED:false}}.
 */
class PortfolioAgentPropertiesTest {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(BindConfig.class);

    @EnableConfigurationProperties(PortfolioAgentProperties.class)
    static class BindConfig {
    }

    @Test
    void agentIsDisabledByDefault() {
        runner.run(ctx ->
                assertThat(ctx.getBean(PortfolioAgentProperties.class).enabled()).isFalse());
    }

    @Test
    void agentCanBeEnabledThroughTheEnvironmentVariable() {
        runner.withPropertyValues("portfolio.ai.agent.enabled=${PORTFOLIO_AI_AGENT_ENABLED:false}")
                .withSystemProperties("PORTFOLIO_AI_AGENT_ENABLED=true")
                .run(ctx ->
                        assertThat(ctx.getBean(PortfolioAgentProperties.class).enabled()).isTrue());
    }

    @Test
    void environmentVariableFalseKeepsAgentDisabled() {
        runner.withPropertyValues("portfolio.ai.agent.enabled=${PORTFOLIO_AI_AGENT_ENABLED:false}")
                .withSystemProperties("PORTFOLIO_AI_AGENT_ENABLED=false")
                .run(ctx ->
                        assertThat(ctx.getBean(PortfolioAgentProperties.class).enabled()).isFalse());
    }

    @Test
    void explicitPropertyOverrideEnablesAgent() {
        runner.withPropertyValues("portfolio.ai.agent.enabled=true")
                .run(ctx ->
                        assertThat(ctx.getBean(PortfolioAgentProperties.class).enabled()).isTrue());
    }
}
