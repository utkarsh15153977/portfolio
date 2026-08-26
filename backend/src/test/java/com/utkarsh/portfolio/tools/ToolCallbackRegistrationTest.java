package com.utkarsh.portfolio.tools;

import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies that PortfolioTools registers correctly with Spring AI's
 * method-based tool calling API — the contract the Phase 4.5 agent will rely
 * on: tool names, non-blank descriptions and JSON input schemas.
 */
class ToolCallbackRegistrationTest {

    private final List<ToolCallback> callbacks = List.of(MethodToolCallbackProvider.builder()
            .toolObjects(new PortfolioTools(new PortfolioKnowledgeLoader()))
            .build()
            .getToolCallbacks());

    @Test
    void registersExactlyTheFourPortfolioTools() {
        assertThat(callbacks)
                .extracting(callback -> callback.getToolDefinition().name())
                .containsExactlyInAnyOrder("searchProjects", "getSkills", "getExperience",
                        "explainArchitecture");
    }

    @Test
    void everyToolHasANonBlankDescription() {
        assertThat(callbacks)
                .allSatisfy(callback -> {
                    String description = callback.getToolDefinition().description();
                    assertThat(description).isNotBlank();
                    assertThat(description).containsIgnoringCase("read-only");
                });
    }

    @Test
    void queryAcceptingToolsExposeAQueryInputSchema() {
        for (String name : new String[]{"searchProjects", "explainArchitecture"}) {
            String schema = schemaOf(name);
            assertThat(schema).contains("query");
        }
        // Zero-argument tools must not require a query parameter.
        assertThat(schemaOf("getSkills")).doesNotContain("query");
        assertThat(schemaOf("getExperience")).doesNotContain("query");
    }

    private String schemaOf(String name) {
        return callbacks.stream()
                .filter(callback -> name.equals(callback.getToolDefinition().name()))
                .findFirst()
                .orElseThrow()
                .getToolDefinition()
                .inputSchema();
    }
}
