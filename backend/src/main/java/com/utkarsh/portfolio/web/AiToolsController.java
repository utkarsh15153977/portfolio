package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.tools.PortfolioTools;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Phase 4.4 — deterministic HTTP coverage for the read-only portfolio tools.
 *
 * GET /api/ai/tools                      → registered tool definitions
 * GET /api/ai/tools/searchProjects?query=
 * GET /api/ai/tools/skills
 * GET /api/ai/tools/experience
 * GET /api/ai/tools/architecture?query=
 *
 * These endpoints execute the {@link Tool @Tool} methods directly — no LLM and
 * no provider key involved — so tool behavior can be verified deterministically.
 * The Phase 4.5 agent will invoke the very same methods through Spring AI's
 * tool-calling API; this controller never mutates state (read-only by design).
 */
@RestController
@RequestMapping("/api/ai/tools")
public class AiToolsController {

    static final String PHASE = "4.4-ai-tools";

    private final PortfolioTools tools;
    private final Map<String, ToolCallback> callbacks = new LinkedHashMap<>();

    public AiToolsController(PortfolioTools tools) {
        this.tools = tools;
        for (ToolCallback callback : MethodToolCallbackProvider.builder()
                .toolObjects(tools)
                .build()
                .getToolCallbacks()) {
            callbacks.put(callback.getToolDefinition().name(), callback);
        }
    }

    /** Lists the tools exactly as a model would see them via function calling. */
    @GetMapping
    public Map<String, Object> list() {
        List<Map<String, Object>> definitions = callbacks.values().stream()
                .map(callback -> Map.<String, Object>of(
                        "name", callback.getToolDefinition().name(),
                        "description", callback.getToolDefinition().description(),
                        "readOnly", true))
                .toList();
        return Map.of(
                "phase", PHASE,
                "count", definitions.size(),
                "tools", definitions);
    }

    @GetMapping("/searchProjects")
    public PortfolioTools.ToolResponse searchProjects(@RequestParam(defaultValue = "") String query) {
        return tools.searchProjects(query);
    }

    @GetMapping("/skills")
    public PortfolioTools.SkillsResponse skills() {
        return tools.getSkills();
    }

    @GetMapping("/experience")
    public PortfolioTools.ToolResponse experience() {
        return tools.getExperience();
    }

    @GetMapping("/architecture")
    public PortfolioTools.ToolResponse architecture(@RequestParam(defaultValue = "") String query) {
        return tools.explainArchitecture(query);
    }
}
