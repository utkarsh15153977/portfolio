package com.utkarsh.portfolio.knowledge;

import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Phase 4.2 knowledge loading + chunking tests:
 * expected portfolio sections load, every chunk carries section/title/source
 * metadata, ids are unique and chunking is deterministic.
 */
class PortfolioKnowledgeLoaderTest {

    private final PortfolioKnowledgeLoader loader = new PortfolioKnowledgeLoader();

    @Test
    void loadsAllExpectedPortfolioSections() {
        List<Document> documents = loader.loadAll();

        Set<String> sections = new HashSet<>();
        documents.forEach(d -> sections.add((String) d.getMetadata().get(PortfolioKnowledgeLoader.META_SECTION)));

        assertThat(sections).containsExactlyInAnyOrder(
                "about", "experience", "projects", "skills",
                "architecture", "education", "ai-lab", "beyond-code");
    }

    @Test
    void everyChunkCarriesMetadataAndNonBlankText() {
        List<Document> documents = loader.loadAll();

        assertThat(documents).isNotEmpty();
        for (Document doc : documents) {
            assertThat(doc.getMetadata())
                    .containsKeys(
                            PortfolioKnowledgeLoader.META_SECTION,
                            PortfolioKnowledgeLoader.META_TITLE,
                            PortfolioKnowledgeLoader.META_SOURCE);
            assertThat(doc.getMetadata().get(PortfolioKnowledgeLoader.META_SOURCE)).isEqualTo("portfolio");
            assertThat(doc.getText()).isNotBlank();
            // chunks stay small enough for retrieval
            assertThat(doc.getText().length()).isLessThan(2000);
        }
    }

    @Test
    void chunkIdsAreUniqueAndStable() {
        List<Document> first = loader.loadAll();
        List<Document> second = loader.loadAll();

        Set<String> ids = new HashSet<>();
        first.forEach(d -> ids.add(d.getId()));
        assertThat(ids).hasSize(first.size());

        // deterministic: same ids, same order, same content
        for (int i = 0; i < first.size(); i++) {
            assertThat(second.get(i).getId()).isEqualTo(first.get(i).getId());
            assertThat(second.get(i).getText()).isEqualTo(first.get(i).getText());
            assertThat(second.get(i).getMetadata()).isEqualTo(first.get(i).getMetadata());
        }
    }

    @Test
    void everyChunkCarriesAStableContentHash() {
        List<Document> first = loader.loadAll();
        List<Document> second = loader.loadAll();

        for (int i = 0; i < first.size(); i++) {
            String hash = (String) first.get(i).getMetadata().get(PortfolioKnowledgeLoader.META_CONTENT_HASH);
            assertThat(hash).isNotBlank().hasSize(64).matches("[0-9a-f]{64}");
            assertThat(second.get(i).getMetadata().get(PortfolioKnowledgeLoader.META_CONTENT_HASH))
                    .isEqualTo(hash);
        }

        // distinct chunks must not share hashes
        long distinct = first.stream()
                .map(d -> d.getMetadata().get(PortfolioKnowledgeLoader.META_CONTENT_HASH))
                .distinct()
                .count();
        assertThat(distinct).isEqualTo(first.size());
    }

    @Test
    void aiLabChunksPreserveExploringVsProductionDistinction() {
        List<Document> aiChunks = loader.loadAll().stream()
                .filter(d -> "ai-lab".equals(d.getMetadata().get(PortfolioKnowledgeLoader.META_SECTION)))
                .toList();

        assertThat(aiChunks).isNotEmpty();
        assertThat(aiChunks)
                .anySatisfy(d -> assertThat(d.getText()).contains("EXPLORING"))
                .anySatisfy(d -> assertThat(d.getText()).contains("FUTURE DIRECTION"));
        assertThat(aiChunks)
                .anySatisfy(d -> assertThat(d.getText()).contains(
                        "NOT professional production AI experience"));
    }
}
