package com.utkarsh.portfolio.knowledge;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;

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
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<Embedding> embeddings = request.getInstructions().stream()
                .map(text -> new Embedding(vector(text), 0))
                .toList();
        return new EmbeddingResponse(embeddings);
    }

    @Override
    public float[] embed(Document document) {
        return vector(document.getText());
    }

    @Override
    public int dimensions() {
        // avoid the default implementation's probe embedding
        return DIMENSIONS;
    }

    float[] vector(String text) {
        float[] v = new float[DIMENSIONS];
        if (text == null || text.isBlank()) {
            return v;
        }
        for (String token : text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+")) {
            if (token.isEmpty()) {
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
        double norm = 0;
        for (float x : v) {
            norm += x * x;
        }
        if (norm > 0) {
            float inv = (float) (1.0 / Math.sqrt(norm));
            for (int i = 0; i < DIMENSIONS; i++) {
                v[i] *= inv;
            }
        }
        return v;
    }
}
