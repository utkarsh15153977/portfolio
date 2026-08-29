package com.utkarsh.portfolio.tools;

import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the Phase 4.4 read-only portfolio tools.
 *
 * Every tool runs against the real generated knowledge file
 * (classpath:knowledge/portfolio-knowledge.json) — the assertions double as a
 * guard that the tools never surface content beyond the portfolio source of
 * truth (no invention) and keep production vs exploration separated.
 */
class PortfolioToolsTest {

    private PortfolioTools tools;

    @BeforeEach
    void setUp() {
        // FIX: Initialize tools with proper null handling
        PortfolioKnowledgeLoader loader = new PortfolioKnowledgeLoader();
        tools = new PortfolioTools(loader);
    }

    // -- searchProjects --------------------------------------------------------

    @Test
    void searchProjectsMatchesKeywordsToProjectChunks() {
        PortfolioTools.ToolResponse response = tools.searchProjects("kafka websocket");

        assertThat(response).isNotNull();
        assertThat(response.section()).isEqualTo("projects");
        assertThat(response.count()).isGreaterThan(0);
        assertThat(response.results()).isNotNull();
        assertThat(response.results())
                .allSatisfy(chunk -> {
                    assertThat(chunk).isNotNull();
                    assertThat(chunk.id()).startsWith("projects:");
                })
                .extracting(PortfolioTools.KnowledgeChunk::id)
                .doesNotHaveDuplicates();
        
        // The flagship chat project (Kafka + WebSockets) must be among the hits.
        assertThat(response.results())
                .extracting(PortfolioTools.KnowledgeChunk::title)
                .contains("REAL-TIME CHAT APPLICATION");
    }

    @Test
    void searchProjectsRanksBetterMatchesFirst() {
        PortfolioTools.ToolResponse response = tools.searchProjects("supabase multi-tenant saas");

        assertThat(response).isNotNull();
        assertThat(response.results()).isNotEmpty();
        assertThat(response.results().get(0)).isNotNull();
        // Source of truth spells the title "BIZFLOW" — case-insensitive check.
        assertThat(response.results().get(0).text()).containsIgnoringCase("bizflow");
    }

    @Test
    void searchProjectsNeverInventsForUnknownQueries() {
        PortfolioTools.ToolResponse response = tools.searchProjects("quantum blockchain metaverse");

        assertThat(response).isNotNull();
        assertThat(response.results()).isEmpty();
        assertThat(response.note()).contains("no matching portfolio knowledge");
    }

    @Test
    void searchProjectsWithBlankQueryReturnsAllProjects() {
        PortfolioTools.ToolResponse blank = tools.searchProjects("");
        PortfolioTools.ToolResponse nullQuery = tools.searchProjects(null);

        assertThat(blank).isNotNull();
        assertThat(nullQuery).isNotNull();
        assertThat(blank.count()).isGreaterThanOrEqualTo(16);
        assertThat(nullQuery.count()).isEqualTo(blank.count());
    }

    @Test
    void searchProjectsTruncatesLongChunksAndFlagsIt() {
        PortfolioTools.ToolResponse response = tools.searchProjects("");

        assertThat(response).isNotNull();
        assertThat(response.results()).isNotNull();
        assertThat(response.results())
                .allSatisfy(chunk -> {
                    assertThat(chunk).isNotNull();
                    assertThat(chunk.text().length()).isLessThanOrEqualTo(PortfolioTools.MAX_TEXT_CHARS);
                    if (chunk.truncated()) {
                        assertThat(chunk.text().length()).isEqualTo(PortfolioTools.MAX_TEXT_CHARS);
                    }
                });
    }

    // -- getSkills -------------------------------------------------------------

    @Test
    void getSkillsSeparatesProductionFromExploring() {
        PortfolioTools.SkillsResponse response = tools.getSkills();

        assertThat(response).isNotNull();
        assertThat(response.production()).isNotNull();
        assertThat(response.exploring()).isNotNull();

        List<String> productionSkills = response.production().stream()
                .filter(group -> group != null)
                .flatMap(group -> {
                    List<String> skills = group.skills();
                    return skills != null ? skills.stream() : java.util.stream.Stream.empty();
                })
                .toList();
        
        List<String> exploringSkills = response.exploring().stream()
                .filter(group -> group != null)
                .flatMap(group -> {
                    List<String> skills = group.skills();
                    return skills != null ? skills.stream() : java.util.stream.Stream.empty();
                })
                .toList();

        assertThat(productionSkills).contains("Java", "Spring Boot", "Kafka", "PostgreSQL");
        assertThat(exploringSkills).containsExactly("LLMs", "RAG", "AI Agents", "Agentic AI");
        // Honest positioning: no overlap between the two buckets.
        assertThat(productionSkills).doesNotContainAnyElementsOf(exploringSkills);
        assertThat(response.exploring()).hasSize(1);
        assertThat(response.exploring().get(0).category()).containsIgnoringCase("EXPLORING");
    }

    @Test
    void getSkillsReturnsEngineeringPracticesWithoutToneAnnotations() {
        PortfolioTools.SkillsResponse response = tools.getSkills();

        assertThat(response).isNotNull();
        assertThat(response.engineeringPractices()).isNotNull();
        assertThat(response.engineeringPractices())
                .containsExactly("Circuit Breaker", "Retry Patterns", "CI/CD", "Agile / Scrum");
    }

    @Test
    void getSkillsProductionCategoriesCarryExactSourceNames() {
        PortfolioTools.SkillsResponse response = tools.getSkills();

        assertThat(response).isNotNull();
        assertThat(response.production()).isNotNull();
        assertThat(response.production())
                .extracting(PortfolioTools.SkillGroup::category)
                .contains("CORE", "BACKEND", "ARCHITECTURE", "DATABASE", "MESSAGING", "AWS",
                        "DEVOPS", "TESTING");
        assertThat(response.note()).containsIgnoringCase("not production");
    }

    // -- getExperience ---------------------------------------------------------

    @Test
    void getExperienceReturnsOnlyPortfolioExperienceEntries() {
        PortfolioTools.ToolResponse response = tools.getExperience();

        assertThat(response).isNotNull();
        assertThat(response.section()).isEqualTo("experience");
        // 1 overview + 8 domain entries from the knowledge file — nothing invented.
        assertThat(response.count()).isEqualTo(9);
        assertThat(response.results()).isNotNull();
        assertThat(response.results())
                .allSatisfy(chunk -> {
                    assertThat(chunk).isNotNull();
                    assertThat(chunk.id()).startsWith("experience:");
                });

        PortfolioTools.KnowledgeChunk overview = response.results().get(0);
        assertThat(overview).isNotNull();
        assertThat(overview.title()).isEqualTo("EdgeVerve Systems (An Infosys Company)");
        assertThat(overview.summary()).contains("Product Developer").contains("09/2022 — 08/2025");
    }

    @Test
    void getExperienceSurfacesVerifiableFactsOnlyFromTheData() {
        PortfolioTools.ToolResponse response = tools.getExperience();

        assertThat(response).isNotNull();
        assertThat(response.results()).isNotNull();
        
        String allText = String.join("\n", response.results().stream()
                .filter(chunk -> chunk != null)
                .map(PortfolioTools.KnowledgeChunk::text)
                .filter(text -> text != null)
                .toList());
        assertThat(allText).contains("30%");          // documented PostgreSQL optimization
        assertThat(allText).contains("Core banking"); // documented domain
    }

    // -- explainArchitecture ---------------------------------------------------

    @Test
    void explainArchitectureClassifiesProductionVsPlannedExploration() {
        PortfolioTools.ToolResponse response = tools.explainArchitecture("");

        assertThat(response).isNotNull();
        assertThat(response.count()).isEqualTo(5);
        assertThat(response.results()).isNotNull();
        
        for (PortfolioTools.KnowledgeChunk chunk : response.results()) {
            assertThat(chunk).isNotNull();
            if (chunk.id().equals("architecture:diagram-ai-agent")) {
                assertThat(chunk.classification()).isEqualTo("planned-exploration");
            } else {
                assertThat(chunk.classification()).isEqualTo("production");
            }
        }
    }

    @Test
    void explainArchitectureMatchesKeywordsAndKeepsClassification() {
        PortfolioTools.ToolResponse kafka = tools.explainArchitecture("kafka event driven");
        assertThat(kafka).isNotNull();
        assertThat(kafka.results()).isNotNull();
        assertThat(kafka.results())
                .extracting(PortfolioTools.KnowledgeChunk::id)
                .contains("architecture:diagram-event-driven");

        PortfolioTools.ToolResponse agent = tools.explainArchitecture("agent orchestration");
        assertThat(agent).isNotNull();
        assertThat(agent.results()).isNotEmpty();
        assertThat(agent.results().get(0).classification()).isEqualTo("planned-exploration");
    }

    @Test
    void explainArchitectureExtractsLayerPipelines() {
        PortfolioTools.ToolResponse response = tools.explainArchitecture("microservices gateway");

        assertThat(response).isNotNull();
        assertThat(response.results()).isNotEmpty();
        assertThat(response.results().get(0).layers()).isNotNull().isNotEmpty();
    }

    @Test
    void explainArchitectureNeverInventsForUnknownQueries() {
        PortfolioTools.ToolResponse response = tools.explainArchitecture("blockchain consensus");

        assertThat(response).isNotNull();
        assertThat(response.results()).isEmpty();
        assertThat(response.note()).contains("no matching portfolio knowledge");
    }

    // -- Additional Edge Case Tests --------------------------------------------

    @Test
    void searchProjectsWithVeryLongQueryIsHandledGracefully() {
        // Build a very long query
        StringBuilder longQuery = new StringBuilder();
        for (int i = 0; i < 100; i++) {
            longQuery.append("keyword").append(i).append(" ");
        }
        
        PortfolioTools.ToolResponse response = tools.searchProjects(longQuery.toString());
        
        assertThat(response).isNotNull();
        // Should not throw any exceptions
    }

    @Test
    void getSkillsHandlesNullResponseGracefully() {
        PortfolioTools.SkillsResponse response = tools.getSkills();
        
        assertThat(response).isNotNull();
        assertThat(response.production()).isNotNull();
        assertThat(response.exploring()).isNotNull();
        assertThat(response.engineeringPractices()).isNotNull();
    }

    @Test
    void getExperienceNeverReturnsNullForAnyField() {
        PortfolioTools.ToolResponse response = tools.getExperience();
        
        assertThat(response).isNotNull();
        assertThat(response.section()).isNotNull();
        assertThat(response.results()).isNotNull();
        assertThat(response.note()).isNotNull();
    }

    @Test
    void explainArchitectureWithNullQueryReturnsAllArchitectureChunks() {
        PortfolioTools.ToolResponse response = tools.explainArchitecture(null);
        
        assertThat(response).isNotNull();
        assertThat(response.count()).isEqualTo(5);
        assertThat(response.results()).hasSize(5);
    }

    @Test
    void allToolsReturnValidToolResponses() {
        // Test each tool returns a valid response
        PortfolioTools.ToolResponse projects = tools.searchProjects("test");
        assertThat(projects).isNotNull();
        assertThat(projects.section()).isNotNull();
        assertThat(projects.results()).isNotNull();
        
        PortfolioTools.ToolResponse experience = tools.getExperience();
        assertThat(experience).isNotNull();
        assertThat(experience.section()).isNotNull();
        assertThat(experience.results()).isNotNull();
        
        PortfolioTools.ToolResponse architecture = tools.explainArchitecture("test");
        assertThat(architecture).isNotNull();
        assertThat(architecture.section()).isNotNull();
        assertThat(architecture.results()).isNotNull();
    }
}