package com.utkarsh.portfolio.knowledge;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.lang.NonNull;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Deterministic test embedding model: bag-of-words hashed into a fixed-size,
 * L2-normalized vector. Same text always yields the same vector; overlapping
 * vocabulary yields proportional similarity. No network, no provider.
 *
 * Used to make retrieval tests fully deterministic.
 */
public class FakeHashEmbedder implements EmbeddingModel {

    public static final int DIMENSIONS = 1024;

    @Override
    public @NonNull EmbeddingResponse call(@NonNull EmbeddingRequest request) {
        // FIX: Add null check for request
        if (request == null) {
            return new EmbeddingResponse(Collections.emptyList());
        }

        // FIX: Safely get instructions with null check
        List<String> instructions = request.getInstructions();
        if (instructions == null) {
            return new EmbeddingResponse(Collections.emptyList());
        }

        // FIX: Handle null or empty instructions
        List<Embedding> embeddings = instructions.stream()
                .map(text -> {
                    // FIX: Handle null text
                    if (text == null) {
                        return new Embedding(new float[DIMENSIONS], 0);
                    }
                    return new Embedding(vector(text), 0);
                })
                .toList();

        return new EmbeddingResponse(embeddings);
    }

    @Override
    public @NonNull float[] embed(@NonNull Document document) {
        // FIX: Add null check for document
        if (document == null) {
            return new float[DIMENSIONS];
        }

        // FIX: Safely get text with null check
        String text = document.getText();
        if (text == null) {
            return new float[DIMENSIONS];
        }

        return vector(text);
    }

    @Override
    public int dimensions() {
        // avoid the default implementation's probe embedding
        return DIMENSIONS;
    }

    /**
     * Convert text to a deterministic hash-based vector.
     * Same text always produces the same vector.
     *
     * @param text The text to convert to a vector (may be null)
     * @return A normalized vector representation of the text
     */
    public float[] vector(String text) {
        float[] v = new float[DIMENSIONS];
        
        // FIX: Add null and empty check
        if (text == null || text.isBlank()) {
            return v;
        }

        // FIX: Safely split text with null check
        String[] tokens = text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+");
        if (tokens == null) {
            return v;
        }

        for (String token : tokens) {
            if (token == null || token.isEmpty()) {
                continue;
            }
            
            // mixed hash keeps unrelated vocabularies from colliding often
            int h = token.hashCode();
            h ^= (h >>> 16);
            h *= 0x5bd1e995;
            h ^= (h >>> 13);
            int idx = (h & 0x7fffffff) % DIMENSIONS;
            v[idx] += 1f;
        }

        // FIX: L2-normalize the vector
        normalize(v);
        return v;
    }

    /**
     * L2-normalize a vector in-place.
     *
     * @param v The vector to normalize (must not be null)
     */
    private void normalize(float[] v) {
        if (v == null) {
            return;
        }

        double norm = 0;
        for (float x : v) {
            norm += x * x;
        }
        
        if (norm > 0) {
            float inv = (float) (1.0 / Math.sqrt(norm));
            for (int i = 0; i < v.length; i++) {
                v[i] *= inv;
            }
        }
    }

    /**
     * Calculate cosine similarity between two vectors.
     * Useful for testing retrieval quality.
     *
     * @param v1 First vector (may be null)
     * @param v2 Second vector (may be null)
     * @return The cosine similarity, or 0 if either vector is null or empty
     */
    public double cosineSimilarity(float[] v1, float[] v2) {
        if (v1 == null || v2 == null || v1.length == 0 || v2.length == 0) {
            return 0;
        }

        int minLength = Math.min(v1.length, v2.length);
        double dot = 0;
        double norm1 = 0;
        double norm2 = 0;

        for (int i = 0; i < minLength; i++) {
            dot += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }

        if (norm1 == 0 || norm2 == 0) {
            return 0;
        }

        return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * Get a sample vector for testing purposes.
     *
     * @return A sample vector
     */
    public float[] sampleVector() {
        float[] v = new float[DIMENSIONS];
        v[0] = 1.0f;
        return normalizeAndReturn(v);
    }

    /**
     * Normalize a vector and return it.
     *
     * @param v The vector to normalize
     * @return The normalized vector
     */
    private float[] normalizeAndReturn(float[] v) {
        normalize(v);
        return v;
    }

    /**
     * Check if the embedder is ready to use.
     *
     * @return true if the embedder is ready
     */
    public boolean isReady() {
        try {
            // Just verify we can create a vector
            vector("test");
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get the embedding for a text with proper null safety.
     *
     * @param text The text to embed (may be null)
     * @return The embedding vector
     */
    public float[] embedText(String text) {
        if (text == null) {
            return new float[DIMENSIONS];
        }
        return vector(text);
    }
}