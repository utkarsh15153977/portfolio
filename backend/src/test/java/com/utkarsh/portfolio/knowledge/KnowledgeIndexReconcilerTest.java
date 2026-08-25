package com.utkarsh.portfolio.knowledge;

import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure reconciliation logic tests (Phase 4.3): minimal change plans for
 * first indexing, unchanged restarts, content changes and removals.
 */
class KnowledgeIndexReconcilerTest {

    private Document doc(String id, String hash) {
        return Document.builder()
                .id(id)
                .text("text of " + id)
                .metadata(Map.of(
                        PortfolioKnowledgeLoader.META_SECTION, "s",
                        PortfolioKnowledgeLoader.META_TITLE, id,
                        PortfolioKnowledgeLoader.META_SOURCE, "portfolio",
                        PortfolioKnowledgeLoader.META_CONTENT_HASH, hash))
                .build();
    }

    @Test
    void firstIndexingAddsEverything() {
        var desired = List.of(doc("a:1", "h1"), doc("a:2", "h2"), doc("b:1", "h3"));

        var plan = KnowledgeIndexReconciler.reconcile(Map.of(), desired);

        assertThat(plan.toAdd()).hasSize(3);
        assertThat(plan.toDelete()).isEmpty();
    }

    @Test
    void unchangedKnowledgeProducesEmptyPlan() {
        var desired = List.of(doc("a:1", "h1"), doc("a:2", "h2"));

        var plan = KnowledgeIndexReconciler.reconcile(
                Map.of("a:1", "h1", "a:2", "h2"), desired);

        assertThat(plan.isEmpty()).isTrue();
        assertThat(plan.toAdd()).isEmpty();
        assertThat(plan.toDelete()).isEmpty();
    }

    @Test
    void changedChunkIsDeletedAndReadded() {
        var desired = List.of(doc("a:1", "h1-NEW"), doc("a:2", "h2"));

        var plan = KnowledgeIndexReconciler.reconcile(
                Map.of("a:1", "h1-OLD", "a:2", "h2"), desired);

        assertThat(plan.toAdd()).extracting(Document::getId).containsExactly("a:1");
        assertThat(plan.toDelete()).containsExactly("a:1");
    }

    @Test
    void removedChunksAreDeleted() {
        var desired = List.of(doc("a:2", "h2"));

        var plan = KnowledgeIndexReconciler.reconcile(
                Map.of("a:1", "h1", "a:2", "h2"), desired);

        assertThat(plan.toDelete()).containsExactly("a:1");
        assertThat(plan.toAdd()).isEmpty();
    }

    @Test
    void chunkWithMissingPersistedHashIsTreatedAsChanged() {
        var desired = List.of(doc("a:1", "h1"));

        // persisted without a hash (e.g. legacy index) → safe re-embed
        var plan = KnowledgeIndexReconciler.reconcile(Map.of("a:1", "null-hash?"), desired);
        assertThat(plan.isEmpty()).isFalse();

        var planMissingKey = KnowledgeIndexReconciler.reconcile(new java.util.HashMap<>(), desired);
        assertThat(planMissingKey.toAdd()).hasSize(1);
    }
}
