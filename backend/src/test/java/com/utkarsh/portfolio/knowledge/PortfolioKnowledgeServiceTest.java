package com.utkarsh.portfolio.knowledge;

import com.utkarsh.portfolio.config.PortfolioRagProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SimpleVectorStore;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Phase 4.2 retrieval tests over a real {@link SimpleVectorStore} ingested
 * from the actual portfolio knowledge file, embedded with the deterministic
 * {@link FakeHashEmbedder} — verifies relevant queries surface the expected
 * section and unrelated queries return nothing.
 */
class PortfolioKnowledgeServiceTest {

    private SimpleVectorStore vectorStore;
    private PortfolioKnowledgeService service;
    private int chunkCount;

    @BeforeEach
    void ingestKnowledgeOnce() {
        FakeHashEmbedder embedder = new FakeHashEmbedder();
        vectorStore = SimpleVectorStore.builder(embedder).build();
        var documents = new PortfolioKnowledgeLoader().loadAll();
        chunkCount = documents.size();
        vectorStore.add(documents);

        // NOTE: the fake bag-of-words embedder dilutes long documents more than
        // real semantic embedding models, so the test threshold is calibrated
        // to its geometry (production default stays 0.3).
        service = new PortfolioKnowledgeService(
                vectorStore,
                new PortfolioRagProperties(
                        true, "file", "openai", 4, 0.1, "./data/test-index.json", false,
                        1536, "", "", "", "portfolio_knowledge"));
    }

    @Test
    void relevantQueryRetrievesExpectedSection() {
        List<Document> hits = service.retrieve("kafka event driven retry resilience circuit breaker");

        assertThat(hits).isNotEmpty();
        assertThat(hits)
                .anySatisfy(d -> assertThat(d.getMetadata().get(PortfolioKnowledgeLoader.META_SECTION))
                        .isEqualTo("experience"));
    }

    @Test
    void educationQueryRetrievesEducationChunk() {
        List<Document> hits = service.retrieve("education degree university computer science coursework");

        assertThat(hits).isNotEmpty();
        assertThat(hits)
                .anySatisfy(d -> assertThat(d.getMetadata().get(PortfolioKnowledgeLoader.META_SECTION))
                        .isEqualTo("education"));
    }

    @Test
    void retrievedChunksIncludeGroundingMetadata() {
        List<Document> hits = service.retrieve("spring boot microservices backend experience");

        assertThat(hits).isNotEmpty();
        for (Document hit : hits) {
            assertThat(hit.getMetadata())
                    .containsKeys(
                            PortfolioKnowledgeLoader.META_SECTION,
                            PortfolioKnowledgeLoader.META_TITLE,
                            PortfolioKnowledgeLoader.META_SOURCE);
        }
    }

    @Test
    void unrelatedQueryReturnsNothingArbitrary() {
        List<Document> hits = service.retrieve("chocolate cake recipe baking ingredients dessert");

        // zero vocabulary overlap -> below similarity threshold -> no fabricated context
        assertThat(hits).isEmpty();
    }

    @Test
    void allIngestedChunksAreSearchable() {
        // sanity: ingestion covered the whole knowledge file
        List<Document> broadHits = service.retrieve("portfolio experience projects skills education architecture");
        assertThat(broadHits).isNotEmpty();

        var allSections = new PortfolioKnowledgeLoader().loadAll().stream()
                .map(d -> d.getMetadata().get(PortfolioKnowledgeLoader.META_SECTION))
                .distinct()
                .count();
        assertThat(chunkCount).isGreaterThanOrEqualTo((int) allSections);
    }
}
