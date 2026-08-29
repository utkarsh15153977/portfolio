package com.utkarsh.portfolio.knowledge;

import com.utkarsh.portfolio.config.PortfolioRagProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SimpleVectorStore;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Phase 4.3 ingestion lifecycle tests over the file backend:
 * first indexing, restart reuse without re-embedding, changed-chunk
 * re-embedding, removal of stale chunks, corruption fail-fast and recovery,
 * and forced rebuilds. Embedding calls are counted via {@link FakeHashEmbedder}.
 */
class PortfolioIndexInitializerTest {

    @TempDir
    Path tempDir;

    private final PortfolioKnowledgeLoader loader = new PortfolioKnowledgeLoader();

    /** Real loader output, optionally mutated to simulate knowledge changes. */
    private PortfolioKnowledgeLoader loaderReturning(List<Document> documents) {
        return new PortfolioKnowledgeLoader() {
            @Override
            public List<Document> loadAll() {
                return documents;
            }
        };
    }

    private record Store(SimpleVectorStore store, AtomicInteger embeddings) {
    }

    private Store newStore() {
        AtomicInteger calls = new AtomicInteger();
        // FIX: Use a separate counter instead of overriding the vector method
        FakeHashEmbedder embedder = new FakeHashEmbedder() {
            @Override
            public float[] embed(Document document) {
                calls.incrementAndGet();
                return super.embed(document);
            }

            @Override
            public float[] embed(String text) {
                calls.incrementAndGet();
                return super.embed(text);
            }
        };
        return new Store(SimpleVectorStore.builder(embedder).build(), calls);
    }

    private PortfolioIndexInitializer initializerFor(Store s, PortfolioKnowledgeLoader l,
                                                     String indexFile, boolean rebuild) {
        return new PortfolioIndexInitializer(
                s.store(),
                l,
                props(indexFile, rebuild));
    }

    private PortfolioRagProperties props(String indexFile, boolean rebuild) {
        return new PortfolioRagProperties(
                true, "file", "openai", 4, 0.3, indexFile, rebuild,
                1536, "", "", "", "portfolio_knowledge");
    }

    /** Same deterministic id, new text, correctly recomputed content hash. */
    private Document withChangedText(Document original, String newText) {
        var metadata = new java.util.LinkedHashMap<String, Object>(original.getMetadata());
        metadata.put(PortfolioKnowledgeLoader.META_CONTENT_HASH,
                PortfolioKnowledgeLoader.contentHash(original.getId(), newText));
        return Document.builder()
                .id(original.getId())
                .text(newText)
                .metadata(metadata)
                .build();
    }

    @Test
    void firstStartupIngestsAndPersistsVectorsAndHashState() throws Exception {
        Path index = tempDir.resolve("portfolio-index.json");
        Store first = newStore();

        initializerFor(first, loader, index.toString(), false).run(null);

        assertThat(index).exists();
        assertThat(PortfolioIndexInitializer.hashStateFile(index.toFile())).exists();
        int expected = loader.loadAll().size();
        assertThat(first.embeddings().get()).isEqualTo(expected);
    }

    @Test
    void unchangedRestartReusesEverythingWithoutAnyEmbedding() throws Exception {
        Path index = tempDir.resolve("portfolio-index.json");

        Store first = newStore();
        initializerFor(first, loader, index.toString(), false).run(null);

        Store second = newStore();
        initializerFor(second, loader, index.toString(), false).run(null);

        assertThat(second.embeddings().get()).as("unchanged restart must not re-embed").isZero();

        var query = org.springframework.ai.vectorstore.SearchRequest.builder()
                .query("kafka event driven retry resilience circuit breaker")
                .topK(4)
                .similarityThreshold(0.0)
                .build();
        List<Document> hits = second.store.similaritySearch(query);
        assertThat(hits).isNotEmpty();
        assertThat(hits.get(0).getMetadata())
                .containsKeys(PortfolioKnowledgeLoader.META_SECTION, PortfolioKnowledgeLoader.META_TITLE);
    }

    @Test
    void changedChunkIsTheOnlyOneReembedded() throws Exception {
        Path index = tempDir.resolve("portfolio-index.json");
        Store first = newStore();
        initializerFor(first, loader, index.toString(), false).run(null);

        // change exactly one chunk's text (and therefore its hash)
        List<Document> originals = loader.loadAll();
        Document victim = originals.get(0);
        List<Document> mutated = new ArrayList<>(originals);
        mutated.set(0, withChangedText(victim, victim.getText() + " UPDATED CONTENT MARKER"));

        Store second = newStore();
        initializerFor(second, loaderReturning(mutated), index.toString(), false).run(null);

        assertThat(second.embeddings().get()).isEqualTo(1);
        assertThat(Files.readString(index)).contains("UPDATED CONTENT MARKER");
    }

    @Test
    void removedChunkIsDeletedFromPersistedIndex() throws Exception {
        Path index = tempDir.resolve("portfolio-index.json");
        Store first = newStore();
        initializerFor(first, loader, index.toString(), false).run(null);

        Document removed = loader.loadAll().get(0);
        List<Document> subset = loader.loadAll().stream()
                .filter(d -> !d.getId().equals(removed.getId()))
                .toList();

        Store second = newStore();
        initializerFor(second, loaderReturning(subset), index.toString(), false).run(null);

        assertThat(second.embeddings().get()).isZero();

        // retrieval against the restarted store: the removed chunk must be gone
        var probe = org.springframework.ai.vectorstore.SearchRequest.builder()
                .query(removed.getText())
                .topK(100)
                .similarityThreshold(0.0)
                .build();
        List<Document> hits = second.store.similaritySearch(probe);
        List<String> hitIds = hits.stream().map(Document::getId).toList();
        assertThat(hitIds)
                .as("removed chunk must disappear from the store")
                .doesNotContain(removed.getId());
        assertThat(second.store.similaritySearch(
                        org.springframework.ai.vectorstore.SearchRequest.builder()
                                .query(loader.loadAll().get(1).getText())
                                .topK(5)
                                .similarityThreshold(0.0)
                                .build()))
                .isNotEmpty();
    }

    @Test
    void corruptStateFailsFastWithActionableMessage() throws Exception {
        Path index = tempDir.resolve("portfolio-index.json");
        Store first = newStore();
        initializerFor(first, loader, index.toString(), false).run(null);

        Files.writeString(PortfolioIndexInitializer.hashStateFile(index.toFile()).toPath(), "{corrupt json");

        Store second = newStore();
        var initializer = initializerFor(second, loader, index.toString(), false);

        assertThatThrownBy(() -> initializer.run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PORTFOLIO_AI_RAG_REBUILD=true");
    }

    @Test
    void inconsistentPartialStateFailsFast() throws Exception {
        Path index = tempDir.resolve("portfolio-index.json");
        Files.writeString(index, "{}"); // index without hash state

        Store second = newStore();
        var initializer = initializerFor(second, loader, index.toString(), false);

        assertThatThrownBy(() -> initializer.run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("inconsistent");
    }

    @Test
    void forcedRebuildRecoversAndReingestsIntoFreshState() throws Exception {
        Path index = tempDir.resolve("portfolio-index.json");
        Files.writeString(index, "{corrupt"); // broken index, rebuild requested

        Store rebuilt = newStore();
        initializerFor(rebuilt, loader, index.toString(), true).run(null);

        assertThat(rebuilt.embeddings().get()).isEqualTo(loader.loadAll().size());
        assertThat(Files.readString(index)).contains("experience:domain-event-driven".substring(0, 10));
    }

    @Test
    void diagnosticSimpleVectorStoreDeleteSemantics() {
        var s = SimpleVectorStore.builder(new FakeHashEmbedder()).build();
        var all = loader.loadAll();
        var d = all.get(0);
        s.add(all);
        s.delete(java.util.List.of(d.getId()));
        var probe = org.springframework.ai.vectorstore.SearchRequest.builder()
                .query(d.getText()).topK(100).similarityThreshold(0.0).build();
        var hits = s.similaritySearch(probe);
        System.out.println("DIAG: probing id=" + d.getId() + " hitsWithSameId="
                + hits.stream().filter(h -> h.getId().equals(d.getId())).count()
                + " totalHits=" + hits.size());
    }
}