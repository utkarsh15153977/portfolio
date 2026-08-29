package com.utkarsh.portfolio.knowledge;

import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure reconciliation logic tests (Phase 4.3): minimal change plans for
 * first indexing, unchanged restarts, content changes and removals.
 */
class KnowledgeIndexReconcilerTest {

    private Document doc(String id, String hash) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put(PortfolioKnowledgeLoader.META_SECTION, "s");
        metadata.put(PortfolioKnowledgeLoader.META_TITLE, id);
        metadata.put(PortfolioKnowledgeLoader.META_SOURCE, "portfolio");
        metadata.put(PortfolioKnowledgeLoader.META_CONTENT_HASH, hash);
        
        return Document.builder()
                .id(id)
                .text("text of " + id)
                .metadata(metadata)
                .build();
    }

    @Test
    void firstIndexingAddsEverything() {
        // Arrange
        var desired = List.of(doc("a:1", "h1"), doc("a:2", "h2"), doc("b:1", "h3"));
        Map<String, String> existing = Collections.emptyMap();

        // Act
        // FIX: Use the static reconcile method directly
        var plan = KnowledgeIndexReconciler.reconcile(existing, desired);

        // Assert
        assertThat(plan.toAdd()).hasSize(3);
        assertThat(plan.toDelete()).isEmpty();
        assertThat(plan.isEmpty()).isFalse();
    }

    @Test
    void unchangedKnowledgeProducesEmptyPlan() {
        // Arrange
        var desired = List.of(doc("a:1", "h1"), doc("a:2", "h2"));
        Map<String, String> existing = Map.of("a:1", "h1", "a:2", "h2");

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existing, desired);

        // Assert
        assertThat(plan.isEmpty()).isTrue();
        assertThat(plan.toAdd()).isEmpty();
        assertThat(plan.toDelete()).isEmpty();
    }

    @Test
    void changedChunkIsDeletedAndReadded() {
        // Arrange
        var desired = List.of(doc("a:1", "h1-NEW"), doc("a:2", "h2"));
        Map<String, String> existing = Map.of("a:1", "h1-OLD", "a:2", "h2");

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existing, desired);

        // Assert
        assertThat(plan.toAdd())
                .extracting(Document::getId)
                .containsExactly("a:1");
        assertThat(plan.toDelete()).containsExactly("a:1");
        assertThat(plan.isEmpty()).isFalse();
    }

    @Test
    void removedChunksAreDeleted() {
        // Arrange
        var desired = List.of(doc("a:2", "h2"));
        Map<String, String> existing = Map.of("a:1", "h1", "a:2", "h2");

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existing, desired);

        // Assert
        assertThat(plan.toDelete()).containsExactly("a:1");
        assertThat(plan.toAdd()).isEmpty();
        assertThat(plan.isEmpty()).isFalse();
    }

    @Test
    void chunkWithMissingPersistedHashIsTreatedAsChanged() {
        // Arrange
        var desired = List.of(doc("a:1", "h1"));
        
        // persisted without a hash (e.g. legacy index) → safe re-embed
        Map<String, String> existingWithNull = new HashMap<>();
        existingWithNull.put("a:1", "null-hash?");

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existingWithNull, desired);

        // Assert
        assertThat(plan.isEmpty()).isFalse();
        assertThat(plan.toAdd()).hasSize(1);
        assertThat(plan.toAdd())
                .extracting(Document::getId)
                .containsExactly("a:1");
        assertThat(plan.toDelete()).containsExactly("a:1");
    }

    @Test
    void chunkWithMissingKeyIsTreatedAsChanged() {
        // Arrange
        var desired = List.of(doc("a:1", "h1"));
        Map<String, String> existingEmpty = new HashMap<>();

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existingEmpty, desired);

        // Assert
        assertThat(plan.toAdd()).hasSize(1);
        assertThat(plan.toAdd())
                .extracting(Document::getId)
                .containsExactly("a:1");
        assertThat(plan.toDelete()).isEmpty();
        assertThat(plan.isEmpty()).isFalse();
    }

    @Test
    void nullExistingMapIsTreatedAsEmpty() {
        // Arrange
        var desired = List.of(doc("a:1", "h1"));

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(null, desired);

        // Assert
        assertThat(plan.toAdd()).hasSize(1);
        assertThat(plan.toAdd())
                .extracting(Document::getId)
                .containsExactly("a:1");
        assertThat(plan.toDelete()).isEmpty();
    }

    @Test
    void nullDesiredListIsTreatedAsEmpty() {
        // Arrange
        Map<String, String> existing = Map.of("a:1", "h1");

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existing, null);

        // Assert
        assertThat(plan.toDelete()).containsExactly("a:1");
        assertThat(plan.toAdd()).isEmpty();
        assertThat(plan.isEmpty()).isFalse();
    }

    @Test
    void nullAndEmptyAreBothHandledGracefully() {
        // Act
        var plan = KnowledgeIndexReconciler.reconcile(null, null);

        // Assert
        assertThat(plan.isEmpty()).isTrue();
        assertThat(plan.toAdd()).isEmpty();
        assertThat(plan.toDelete()).isEmpty();
    }

    @Test
    void hashValueWithNullIsTreatedAsChanged() {
        // Arrange
        var desired = List.of(doc("a:1", null));
        Map<String, String> existing = Map.of("a:1", "some-hash");

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existing, desired);

        // Assert
        assertThat(plan.toAdd()).hasSize(1);
        assertThat(plan.toDelete()).containsExactly("a:1");
    }

    @Test
    void multipleChangesAreHandledCorrectly() {
        // Arrange
        var desired = List.of(
                doc("a:1", "h1-NEW"),      // Changed
                doc("a:2", "h2"),           // Unchanged
                doc("b:1", "h3-NEW")        // New
        );
        Map<String, String> existing = Map.of(
                "a:1", "h1-OLD",
                "a:2", "h2",
                "c:1", "h4"                 // Removed
        );

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existing, desired);

        // Assert
        assertThat(plan.toAdd())
                .extracting(Document::getId)
                .containsExactlyInAnyOrder("a:1", "b:1");
        assertThat(plan.toDelete())
                .containsExactlyInAnyOrder("a:1", "c:1");
        assertThat(plan.isEmpty()).isFalse();
    }

    @Test
    void documentWithoutMetadataIsHandledGracefully() {
        // Arrange
        Document docWithoutMetadata = Document.builder()
                .id("no-meta")
                .text("text")
                .build();
        var desired = List.of(docWithoutMetadata);
        Map<String, String> existing = Collections.emptyMap();

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existing, desired);

        // Assert
        assertThat(plan.toAdd()).hasSize(1);
        assertThat(plan.toAdd())
                .extracting(Document::getId)
                .containsExactly("no-meta");
    }

    @Test
    void emptyDesiredListWithNonEmptyExistingDeletesAll() {
        // Arrange
        var desired = List.<Document>of();
        Map<String, String> existing = Map.of("a:1", "h1", "a:2", "h2");

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existing, desired);

        // Assert
        assertThat(plan.toDelete())
                .containsExactlyInAnyOrder("a:1", "a:2");
        assertThat(plan.toAdd()).isEmpty();
        assertThat(plan.isEmpty()).isFalse();
    }

    @Test
    void emptyExistingMapWithNonEmptyDesiredAddsAll() {
        // Arrange
        var desired = List.of(doc("a:1", "h1"), doc("a:2", "h2"));
        Map<String, String> existing = Collections.emptyMap();

        // Act
        var plan = KnowledgeIndexReconciler.reconcile(existing, desired);

        // Assert
        assertThat(plan.toAdd()).hasSize(2);
        assertThat(plan.toDelete()).isEmpty();
        assertThat(plan.isEmpty()).isFalse();
    }
}