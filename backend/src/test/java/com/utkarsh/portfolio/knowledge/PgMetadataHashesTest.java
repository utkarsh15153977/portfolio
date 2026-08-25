package com.utkarsh.portfolio.knowledge;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Parsing of pgvector metadata JSON for content hashes — the lookup that
 * drives incremental reconciliation against PostgreSQL.
 */
class PgMetadataHashesTest {

    @Test
    void extractsHashFromMetadataJson() {
        assertThat(PgVectorIndexInitializer.PgMetadataHashes.extract(
                "{\"content_hash\": \"abc123\", \"section\": \"experience\"}"))
                .isEqualTo("abc123");
    }

    @Test
    void toleratesMissingNullAndGarbageMetadata() {
        assertThat(PgVectorIndexInitializer.PgMetadataHashes.extract(null)).isNull();
        assertThat(PgVectorIndexInitializer.PgMetadataHashes.extract("")).isNull();
        assertThat(PgVectorIndexInitializer.PgMetadataHashes.extract("{}")).isNull();
        assertThat(PgVectorIndexInitializer.PgMetadataHashes.extract("{\"content_hash\": null}")).isNull();
        assertThat(PgVectorIndexInitializer.PgMetadataHashes.extract("{not json")).isNull();
    }
}
