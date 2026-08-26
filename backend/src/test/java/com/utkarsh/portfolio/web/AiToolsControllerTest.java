package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import com.utkarsh.portfolio.tools.PortfolioTools;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
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
    MockMvc mockMvc;

    @Test
    void listsAllRegisteredReadOnlyTools() throws Exception {
        mockMvc.perform(get("/api/ai/tools"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phase").value(AiToolsController.PHASE))
                .andExpect(jsonPath("$.count").value(4))
                .andExpect(jsonPath("$.tools", hasSize(4)))
                .andExpect(jsonPath("$.tools[*].name").value(
                        org.hamcrest.Matchers.hasItem("searchProjects")))
                .andExpect(jsonPath("$.tools[*].readOnly").value(
                        org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.is(true))));
    }

    @Test
    void searchProjectsEndpointReturnsMatchingChunks() throws Exception {
        mockMvc.perform(get("/api/ai/tools/searchProjects").param("query", "kafka websocket"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.section").value("projects"))
                .andExpect(jsonPath("$.count").value(greaterThan(0)))
                .andExpect(jsonPath("$.results[0].id").value(
                        org.hamcrest.Matchers.startsWith("projects:")));
    }

    @Test
    void searchProjectsEndpointWithoutQueryReturnsAllProjects() throws Exception {
        mockMvc.perform(get("/api/ai/tools/searchProjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(greaterThan(15)));
    }

    @Test
    void skillsEndpointSplitsProductionFromExploring() throws Exception {
        mockMvc.perform(get("/api/ai/tools/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.production", hasSize(8)))
                .andExpect(jsonPath("$.exploring[0].skills").value(
                        org.hamcrest.Matchers.hasItem("LLMs")))
                .andExpect(jsonPath("$.engineeringPractices").value(
                        org.hamcrest.Matchers.hasItem("Circuit Breaker")));
    }

    @Test
    void experienceEndpointReturnsPortfolioEntries() throws Exception {
        mockMvc.perform(get("/api/ai/tools/experience"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(9))
                .andExpect(jsonPath("$.results[0].title").value("EdgeVerve Systems (An Infosys Company)"));
    }

    @Test
    void architectureEndpointClassifiesExploration() throws Exception {
        mockMvc.perform(get("/api/ai/tools/architecture").param("query", "agent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].classification").value("planned-exploration"));
    }

    @Test
    void architectureEndpointBlankQueryReturnsAllDiagrams() throws Exception {
        mockMvc.perform(get("/api/ai/tools/architecture"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
    }
}
