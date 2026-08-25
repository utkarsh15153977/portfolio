package com.utkarsh.portfolio.knowledge;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads the structured portfolio knowledge file and converts it into Spring AI
 * {@link org.springframework.ai.document.Document}s ready for embedding.
 *
 * The knowledge file (classpath:knowledge/portfolio-knowledge.json) is
 * GENERATED from the frontend's single source of truth lib/portfolio-data.ts by
 * backend/tools/extract-knowledge.mjs — portfolio facts are not hand-copied
 * into Java code.
 *
 * Chunking is deterministic: one document per logical item, stable ids of the
 * form {@code <section>:<key>}, fixed iteration order, and metadata carrying
 * section / title / source for grounded, citable context.
 */
@Component
public class PortfolioKnowledgeLoader {

    /** Metadata keys attached to every chunk. */
    public static final String META_SECTION = "section";
    public static final String META_TITLE = "title";
    public static final String META_SOURCE = "source";

    /**
     * Deterministic SHA-256 fingerprint of the chunk content (Phase 4.3) —
     * used by index reconciliation to re-embed only changed chunks.
     */
    public static final String META_CONTENT_HASH = "content_hash";

    static final String KNOWLEDGE_RESOURCE = "knowledge/portfolio-knowledge.json";

    private final ObjectMapper objectMapper = new ObjectMapper();

    // -- JSON shape (tolerant of extra fields so the knowledge file can evolve) --

    @JsonIgnoreProperties(ignoreUnknown = true)
    record KnowledgeFile(String generatedFrom, List<KnowledgeSection> sections) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record KnowledgeSection(String section, String title, List<KnowledgeItem> items) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record KnowledgeItem(String key, String title, List<String> lines, List<String> tags) {
    }

    // -- API ------------------------------------------------------------------

    /**
     * @return every knowledge chunk as a document, in deterministic file order.
     */
    public List<org.springframework.ai.document.Document> loadAll() {
        KnowledgeFile file;
        try (InputStream in = new ClassPathResource(KNOWLEDGE_RESOURCE).getInputStream()) {
            file = objectMapper.readValue(in, KnowledgeFile.class);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load portfolio knowledge resource", e);
        }

        List<org.springframework.ai.document.Document> documents = new ArrayList<>();
        for (KnowledgeSection kSection : file.sections()) {
            for (KnowledgeItem kItem : kSection.items()) {
                documents.add(toDocument(kSection, kItem));
            }
        }
        return List.copyOf(documents);
    }

    private org.springframework.ai.document.Document toDocument(KnowledgeSection kSection, KnowledgeItem kItem) {
        StringBuilder text = new StringBuilder(kItem.title()).append('\n');
        String joined = String.join("\n", normalized(kItem.lines()));
        text.append(joined);
        if (kItem.tags() != null && !kItem.tags().isEmpty()) {
            text.append("\nTags: ").append(String.join(", ", kItem.tags()));
        }

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put(META_SECTION, kSection.section());
        metadata.put(META_TITLE, kItem.title());
        metadata.put(META_SOURCE, "portfolio");
        metadata.put(META_CONTENT_HASH, contentHash(kSection.section() + ":" + kItem.key(), text.toString()));

        return org.springframework.ai.document.Document.builder()
                .id(kSection.section() + ":" + kItem.key())
                .text(text.toString())
                .metadata(metadata)
                .build();
    }

    /**
     * Stable SHA-256 over id + text. Identical chunks across restarts and
     * releases produce identical hashes — the basis for incremental indexing.
     */
    static String contentHash(String id, String text) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest((id + "\n" + text).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                hex.append(Character.forDigit((b >> 4) & 0xF, 16)).append(Character.forDigit(b & 0xF, 16));
            }
            return hex.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private static List<String> normalized(List<String> lines) {
        if (lines == null) {
            return List.of("");
        }
        return lines.stream().map(l -> l == null ? "" : l).toList();
    }
}
