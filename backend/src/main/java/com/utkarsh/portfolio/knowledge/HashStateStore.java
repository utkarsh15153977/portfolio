package com.utkarsh.portfolio.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.File;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Persists the id → content-hash state next to the vector index file
 * ({@code <indexFile>.hashes.json}). This is what allows the file backend to
 * detect changed/removed chunks across restarts without re-embedding.
 *
 * JSON is written deterministically (sorted keys) so the artifact is stable
 * and diff-able.
 */
public class HashStateStore {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS);

    private final File file;

    public HashStateStore(File file) {
        this.file = file;
    }

    public boolean fileExists() {
        return file.exists();
    }

    /** @throws IllegalStateException when the file exists but is unreadable/corrupt. */
    public Map<String, String> load() {
        if (!file.exists()) {
            return Map.of();
        }
        try {
            var mapType = MAPPER.getTypeFactory()
                    .constructMapType(LinkedHashMap.class, String.class, String.class);
            Map<String, String> read = MAPPER.readValue(file, mapType);
            return new LinkedHashMap<>(read);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Index hash state file is unreadable or corrupt: " + file.getAbsolutePath()
                            + ". Set PORTFOLIO_AI_RAG_REBUILD=true to rebuild the index.",
                    e);
        }
    }

    public void save(Map<String, String> idToHash) throws IOException {
        File parent = file.getAbsoluteFile().getParentFile();
        if (parent != null && !parent.exists() && !parent.mkdirs()) {
            throw new IOException("Could not create index directory " + parent);
        }
        MAPPER.writerWithDefaultPrettyPrinter().writeValue(file, idToHash);
    }
}
