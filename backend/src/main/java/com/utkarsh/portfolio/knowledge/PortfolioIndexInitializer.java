package com.utkarsh.portfolio.knowledge;

import com.utkarsh.portfolio.config.PortfolioRagProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Deterministic, incremental knowledge ingestion — file backend (Phases 4.2 + 4.3).
 *
 * Startup lifecycle:
 *  1. Fresh start (no index yet, or forced rebuild): chunk → embed once →
 *     persist vectors + hash state.
 *  2. Restart: load persisted vectors, reconcile against the desired knowledge
 *     set via content hashes — unchanged chunks are reused as-is (never
 *     re-embedded), changed chunks are replaced, removed chunks are deleted.
 *     The store is only re-persisted when something actually changed.
 *
 * A corrupt/unreadable index or hash state fails startup fast with an
 * actionable message: silently rebuilding could hide grounding regressions
 * behind surprise embedding costs. Recovery is explicit:
 * PORTFOLIO_AI_RAG_REBUILD=true.
 */
@Component
@ConditionalOnBean(SimpleVectorStore.class)
public class PortfolioIndexInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PortfolioIndexInitializer.class);

    private final SimpleVectorStore vectorStore;
    private final PortfolioKnowledgeLoader loader;
    private final PortfolioRagProperties properties;

    public PortfolioIndexInitializer(SimpleVectorStore vectorStore,
                                     PortfolioKnowledgeLoader loader,
                                     PortfolioRagProperties properties) {
        this.vectorStore = vectorStore;
        this.loader = loader;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) throws IOException {
        File indexFile = new File(properties.indexFile());
        HashStateStore stateStore = new HashStateStore(hashStateFile(indexFile));

        boolean haveIndex = indexFile.exists();
        boolean haveState = stateStore.fileExists();

        if (!properties.rebuildOnStartup() && haveIndex && haveState) {
            reconcileExisting(indexFile, stateStore);
            return;
        }

        if (!properties.rebuildOnStartup() && (haveIndex || haveState)) {
            // partial state = interrupted previous write; refuse to guess
            throw new IllegalStateException(
                    "Portfolio index is inconsistent (index file present: " + haveIndex
                            + ", hash state present: " + haveState + ") at "
                            + indexFile.getAbsolutePath()
                            + ". Set PORTFOLIO_AI_RAG_REBUILD=true to rebuild it.");
        }

        ingestFresh(stateStore);
    }

    private void reconcileExisting(File indexFile, HashStateStore stateStore) throws IOException {
        vectorStore.load(indexFile);
        Map<String, String> existing = stateStore.load();

        KnowledgeIndexReconciler.Plan plan =
                KnowledgeIndexReconciler.reconcile(existing, loader.loadAll());

        if (plan.isEmpty()) {
            log.info("Portfolio knowledge index up to date ({} chunks), loaded from {}",
                    existing.size(), indexFile.getAbsolutePath());
            return;
        }

        if (!plan.toDelete().isEmpty()) {
            vectorStore.delete(plan.toDelete());
        }
        if (!plan.toAdd().isEmpty()) {
            vectorStore.add(plan.toAdd());
        }

        stateStore.save(currentHashes());
        vectorStore.save(indexFile);
        log.info("Portfolio knowledge index reconciled: +{} added/updated, -{} removed (now at {})",
                plan.toAdd().size(), plan.toDelete().size(), indexFile.getAbsolutePath());
    }

    private void ingestFresh(HashStateStore stateStore) throws IOException {
        var documents = loader.loadAll();
        log.info("Ingesting {} portfolio knowledge chunks into the local vector store", documents.size());
        vectorStore.add(documents);
        stateStore.save(currentHashes());
        vectorStore.save(new File(properties.indexFile()));
        log.info("Persisted portfolio knowledge index to {}", properties.indexFile());
    }

    private Map<String, String> currentHashes() {
        Map<String, String> hashes = new LinkedHashMap<>();
        for (Document doc : loader.loadAll()) {
            hashes.put(doc.getId(),
                    String.valueOf(doc.getMetadata().get(PortfolioKnowledgeLoader.META_CONTENT_HASH)));
        }
        return hashes;
    }

    static File hashStateFile(File indexFile) {
        return new File(indexFile.getParentFile(), indexFile.getName() + ".hashes.json");
    }
}
