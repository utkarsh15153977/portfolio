package com.utkarsh.portfolio.knowledge;

import com.fasterxml.jackson.databind.JsonNode;
import com.utkarsh.portfolio.config.PortfolioRagProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Deterministic, incremental knowledge ingestion — PostgreSQL/pgvector backend (Phase 4.3).
 *
 * Persistence lives in the database, so "restart" behavior is a reconciliation:
 * existing chunk hashes are read from the vector table's metadata column and
 * diffed against the desired knowledge set. Only new/changed chunks are
 * embedded; removed chunks are deleted; an up-to-date store is left untouched.
 *
 * A database that cannot be reached fails startup fast (Hikari +
 * initializeSchema) — serving answers without a verified index is never
 * acceptable for grounding integrity.
 */
@Component
@ConditionalOnBean(PgVectorStore.class)
public class PgVectorIndexInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PgVectorIndexInitializer.class);

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;
    private final PortfolioKnowledgeLoader loader;
    private final PortfolioRagProperties properties;

    public PgVectorIndexInitializer(VectorStore vectorStore,
                                    JdbcTemplate jdbcTemplate,
                                    PortfolioKnowledgeLoader loader,
                                    PortfolioRagProperties properties) {
        this.vectorStore = vectorStore;
        this.jdbcTemplate = jdbcTemplate;
        this.loader = loader;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        var documents = loader.loadAll();
        Map<String, String> existing = loadPersistedHashes();

        KnowledgeIndexReconciler.Plan plan = KnowledgeIndexReconciler.reconcile(existing, documents);

        if (plan.isEmpty()) {
            log.info("pgvector portfolio knowledge index up to date ({} chunks in '{}')",
                    existing.size(), properties.pgTable());
            return;
        }

        if (!plan.toDelete().isEmpty()) {
            vectorStore.delete(plan.toDelete());
        }
        if (!plan.toAdd().isEmpty()) {
            vectorStore.add(plan.toAdd());
        }
        log.info("pgvector index reconciled: +{} added/updated, -{} removed ('{}')",
                plan.toAdd().size(), plan.toDelete().size(), properties.pgTable());
    }

    Map<String, String> loadPersistedHashes() {
        String sql = "SELECT uuid, metadata::text FROM " + properties.pgTable();
        Map<String, String> hashes = new HashMap<>();
        jdbcTemplate.query(sql, rs -> {
            String id = rs.getString(1);
            String metadataJson = rs.getString(2);
            String hash = PgMetadataHashes.extract(metadataJson);
            if (hash != null) {
                hashes.put(id, hash);
            }
        });
        return hashes;
    }

    /** Parsing helper kept package-visible for deterministic unit tests. */
    static final class PgMetadataHashes {

        private PgMetadataHashes() {
        }

        static String extract(String metadataJson) {
            if (metadataJson == null || metadataJson.isBlank()) {
                return null;
            }
            try {
                JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(metadataJson);
                JsonNode hash = node.get(PortfolioKnowledgeLoader.META_CONTENT_HASH);
                return hash == null || hash.isNull() ? null : hash.asText();
            } catch (Exception e) {
                // unparseable metadata = treat chunk as changed → it gets re-embedded
                return null;
            }
        }
    }
}
