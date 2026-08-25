package com.utkarsh.portfolio.knowledge;

import org.springframework.ai.document.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Pure, deterministic index reconciliation (Phase 4.3).
 *
 * Compares the chunks currently persisted in a vector store against the
 * desired knowledge chunks and produces the minimal change plan:
 *
 *  - brand-new chunks            → toAdd
 *  - changed chunks (hash diff)  → toDelete(id) + toAdd  (safe for any backend,
 *                                                 upsert or not)
 *  - removed chunks              → toDelete
 *  - unchanged chunks            → nothing (never re-embedded)
 *
 * No backend, no I/O — trivially unit-testable.
 */
public final class KnowledgeIndexReconciler {

    private KnowledgeIndexReconciler() {
    }

    public record Plan(List<Document> toAdd, List<String> toDelete) {

        public boolean isEmpty() {
            return toAdd.isEmpty() && toDelete.isEmpty();
        }
    }

    /**
     * @param existingIdToHash id → content_hash currently persisted
     * @param desired          the full desired chunk set (deterministic order)
     */
    public static Plan reconcile(Map<String, String> existingIdToHash, List<Document> desired) {
        Objects.requireNonNull(existingIdToHash, "existingIdToHash");
        Objects.requireNonNull(desired, "desired");

        List<Document> toAdd = new ArrayList<>();
        List<String> toDelete = new ArrayList<>();

        for (Document doc : desired) {
            String hash = String.valueOf(
                    doc.getMetadata().getOrDefault(PortfolioKnowledgeLoader.META_CONTENT_HASH, ""));
            String existing = existingIdToHash.get(doc.getId());
            if (existing == null) {
                toAdd.add(doc);
            } else if (!existing.equals(hash)) {
                // content changed under the same deterministic id
                toDelete.add(doc.getId());
                toAdd.add(doc);
            }
        }

        for (String existingId : existingIdToHash.keySet()) {
            boolean stillDesired = desired.stream().anyMatch(d -> d.getId().equals(existingId));
            if (!stillDesired) {
                toDelete.add(existingId);
            }
        }

        return new Plan(List.copyOf(toAdd), List.copyOf(toDelete));
    }
}
