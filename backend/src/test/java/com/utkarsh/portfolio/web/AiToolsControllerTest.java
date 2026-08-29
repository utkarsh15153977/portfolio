package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import com.utkarsh.portfolio.tools.PortfolioTools;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Endpoint contract tests for the Phase 4.4 read-only tool endpoints under
 * /api/ai/tools. The real PortfolioTools run against the real knowledge file —
 * no LLM and no provider key involved.
 */
@WebMvcTest(AiToolsController.class)
@Import({PortfolioTools.class, PortfolioKnowledgeLoader.class})
class AiToolsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setUp() {
        // FIX: Ensure mockMvc is properly initialized
        if (mockMvc == null) {
            mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        }
    }

    @Test
    void listsAllRegisteredReadOnlyTools() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phase").value(AiToolsController.PHASE))
                .andExpect(jsonPath("$.count").value(4))
                .andExpect(jsonPath("$.tools", hasSize(4)))
                .andExpect(jsonPath("$.tools[*].name", hasItem("searchProjects")))
                .andExpect(jsonPath("$.tools[*].readOnly", everyItem(is(true))));
    }

    @Test
    void searchProjectsEndpointReturnsMatchingChunks() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/searchProjects")
                        .param("query", "kafka websocket"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.section").value("projects"))
                .andExpect(jsonPath("$.count", greaterThan(0)))
                .andExpect(jsonPath("$.results[0].id", startsWith("projects:")));
    }

    @Test
    void searchProjectsEndpointWithoutQueryReturnsAllProjects() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/searchProjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", greaterThan(15)));
    }

    @Test
    void skillsEndpointSplitsProductionFromExploring() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.production", hasSize(8)))
                .andExpect(jsonPath("$.exploring[0].skills", hasItem("LLMs")))
                .andExpect(jsonPath("$.engineeringPractices", hasItem("Circuit Breaker")));
    }

    @Test
    void experienceEndpointReturnsPortfolioEntries() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/experience"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(9))
                .andExpect(jsonPath("$.results[0].title").value("EdgeVerve Systems (An Infosys Company)"));
    }

    @Test
    void architectureEndpointClassifiesExploration() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/architecture")
                        .param("query", "agent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].classification").value("planned-exploration"));
    }

    @Test
    void architectureEndpointBlankQueryReturnsAllDiagrams() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/architecture"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
    }

    @Test
    void searchProjectsEndpointWithEmptyQuery() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/searchProjects")
                        .param("query", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", greaterThan(15)))
                .andExpect(jsonPath("$.results").isArray());
    }

    @Test
    void searchProjectsEndpointWithNullQuery() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        // Not providing the query parameter at all
        mockMvc.perform(get("/api/ai/tools/searchProjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", greaterThan(15)))
                .andExpect(jsonPath("$.results").isArray());
    }

    @Test
    void architectureEndpointWithUnknownQuery() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/architecture")
                        .param("query", "unknown-query-that-should-not-match-anything"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0))
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(jsonPath("$.results").isEmpty());
    }

    @Test
    void experienceEndpointReturnsCorrectStructure() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/experience"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.section").value("experience"))
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(jsonPath("$.results[0].id").exists())
                .andExpect(jsonPath("$.results[0].title").exists())
                .andExpect(jsonPath("$.results[0].text").exists());
    }

    @Test
    void skillsEndpointReturnsCorrectStructure() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note").exists())
                .andExpect(jsonPath("$.production").isArray())
                .andExpect(jsonPath("$.exploring").isArray())
                .andExpect(jsonPath("$.engineeringPractices").isArray());
    }

    @Test
    void architectureEndpointReturnsCorrectStructure() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/tools/architecture"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.section").value("architecture"))
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(jsonPath("$.results[0].id").exists())
                .andExpect(jsonPath("$.results[0].classification").exists());
    }
}