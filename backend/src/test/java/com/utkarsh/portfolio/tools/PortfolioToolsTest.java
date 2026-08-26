package com.utkarsh.portfolio.tools;

import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
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

    private final PortfolioTools tools = new PortfolioTools(new PortfolioKnowledgeLoader());

    // -- searchProjects --------------------------------------------------------

    @Test
    void searchProjectsMatchesKeywordsToProjectChunks() {
        PortfolioTools.ToolResponse response = tools.searchProjects("kafka websocket");

        assertThat(response.section()).isEqualTo("projects");
        assertThat(response.count()).isGreaterThan(0);
        assertThat(response.results())
                .allSatisfy(chunk -> assertThat(chunk.id()).startsWith("projects:"))
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

        assertThat(response.results()).isNotEmpty();
        // Source of truth spells the title "BIZFLOW" — case-insensitive check.
        assertThat(response.results().get(0).text()).containsIgnoringCase("bizflow");
    }

    @Test
    void searchProjectsNeverInventsForUnknownQueries() {
        PortfolioTools.ToolResponse response = tools.searchProjects("quantum blockchain metaverse");

        assertThat(response.results()).isEmpty();
        assertThat(response.note()).contains("no matching portfolio knowledge");
    }

    @Test
    void searchProjectsWithBlankQueryReturnsAllProjects() {
        PortfolioTools.ToolResponse blank = tools.searchProjects("");
        PortfolioTools.ToolResponse nullQuery = tools.searchProjects(null);

        assertThat(blank.count()).isGreaterThanOrEqualTo(16);
        assertThat(nullQuery.count()).isEqualTo(blank.count());
    }

    @Test
    void searchProjectsTruncatesLongChunksAndFlagsIt() {
        PortfolioTools.ToolResponse response = tools.searchProjects("");

        assertThat(response.results())
                .allSatisfy(chunk -> {
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

        List<String> productionSkills = response.production().stream()
                .flatMap(group -> group.skills().stream())
                .toList();
        List<String> exploringSkills = response.exploring().stream()
                .flatMap(group -> group.skills().stream())
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

        assertThat(response.engineeringPractices())
                .containsExactly("Circuit Breaker", "Retry Patterns", "CI/CD", "Agile / Scrum");
    }

    @Test
    void getSkillsProductionCategoriesCarryExactSourceNames() {
        PortfolioTools.SkillsResponse response = tools.getSkills();

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

        assertThat(response.section()).isEqualTo("experience");
        // 1 overview + 8 domain entries from the knowledge file — nothing invented.
        assertThat(response.count()).isEqualTo(9);
        assertThat(response.results())
                .allSatisfy(chunk -> assertThat(chunk.id()).startsWith("experience:"));

        PortfolioTools.KnowledgeChunk overview = response.results().get(0);
        assertThat(overview.title()).isEqualTo("EdgeVerve Systems (An Infosys Company)");
        assertThat(overview.summary()).contains("Product Developer").contains("09/2022 — 08/2025");
    }

    @Test
    void getExperienceSurfacesVerifiableFactsOnlyFromTheData() {
        PortfolioTools.ToolResponse response = tools.getExperience();

        String allText = String.join("\n", response.results().stream()
                .map(PortfolioTools.KnowledgeChunk::text)
                .toList());
        assertThat(allText).contains("30%");          // documented PostgreSQL optimization
        assertThat(allText).contains("Core banking"); // documented domain
    }

    // -- explainArchitecture ---------------------------------------------------

    @Test
    void explainArchitectureClassifiesProductionVsPlannedExploration() {
        PortfolioTools.ToolResponse response = tools.explainArchitecture("");

        assertThat(response.count()).isEqualTo(5);
        for (PortfolioTools.KnowledgeChunk chunk : response.results()) {
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
        assertThat(kafka.results())
                .extracting(PortfolioTools.KnowledgeChunk::id)
                .contains("architecture:diagram-event-driven");

        PortfolioTools.ToolResponse agent = tools.explainArchitecture("agent orchestration");
        assertThat(agent.results()).isNotEmpty();
        assertThat(agent.results().get(0).classification()).isEqualTo("planned-exploration");
    }

    @Test
    void explainArchitectureExtractsLayerPipelines() {
        PortfolioTools.ToolResponse response = tools.explainArchitecture("microservices gateway");

        assertThat(response.results()).isNotEmpty();
        assertThat(response.results().get(0).layers()).isNotNull().isNotEmpty();
    }

    @Test
    void explainArchitectureNeverInventsForUnknownQueries() {
        PortfolioTools.ToolResponse response = tools.explainArchitecture("blockchain consensus");

        assertThat(response.results()).isEmpty();
        assertThat(response.note()).contains("no matching portfolio knowledge");
    }
}
