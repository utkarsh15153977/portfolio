package com.utkarsh.portfolio.knowledge;

import com.utkarsh.portfolio.config.PortfolioRagProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Retrieval half of the RAG layer (Phases 4.2 + 4.3).
 *
 * Given a user question, performs a similarity search over the ingested
 * portfolio knowledge and returns the most relevant chunks together with their
 * metadata (section / title / source) so the chat service can compose a
 * grounded, attributable context.
 *
 * Works against the generic VectorStore interface: file backend locally,
 * PostgreSQL+pgvector in production. The number of retrieved chunks (top-k)
 * and the similarity threshold are configurable; only present when RAG is
 * enabled and a store backend is active.
 */
@Service
@ConditionalOnBean(VectorStore.class)
public class PortfolioKnowledgeService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioKnowledgeService.class);

    private final VectorStore vectorStore;
    private final PortfolioRagProperties properties;

    public PortfolioKnowledgeService(@NonNull VectorStore vectorStore, 
                                     @NonNull PortfolioRagProperties properties) {
        // FIX: Add null checks for all dependencies
        if (vectorStore == null) {
            throw new IllegalArgumentException("VectorStore must not be null");
        }
        if (properties == null) {
            throw new IllegalArgumentException("PortfolioRagProperties must not be null");
        }
        
        this.vectorStore = vectorStore;
        this.properties = properties;
        
        log.info("PortfolioKnowledgeService initialized with topK={}, similarityThreshold={}", 
                properties.topK(), properties.similarityThreshold());
    }

    /**
     * Retrieve relevant portfolio chunks for the question.
     * 
     * @param question The user's question (must not be null or blank)
     * @return relevant portfolio chunks for the question — possibly empty when
     *         nothing clears the configured similarity threshold
     * @throws IllegalArgumentException if question is null or blank
     */
    public List<Document> retrieve(@NonNull String question) {
        // FIX: Enhanced input validation
        if (question == null) {
            throw new IllegalArgumentException("question must not be null");
        }
        if (question.isBlank()) {
            throw new IllegalArgumentException("question must not be blank");
        }
        
        long startedAt = System.nanoTime();
        log.debug("Retrieving documents for question: {}", question);
        
        try {
            // FIX: Safely build SearchRequest with null-safe property access
            Integer topK = properties.topK();
            if (topK == null) {
                topK = 5; // Default fallback
                log.warn("topK property is null, using default: {}", topK);
            }
            
            Double similarityThreshold = properties.similarityThreshold();
            if (similarityThreshold == null) {
                similarityThreshold = 0.7; // Default fallback
                log.warn("similarityThreshold property is null, using default: {}", similarityThreshold);
            }
            
            SearchRequest request = SearchRequest.builder()
                    .query(question.trim())
                    .topK(topK)
                    .similarityThreshold(similarityThreshold)
                    .build();
            
            // FIX: Safely execute search with null handling
            List<Document> results = vectorStore.similaritySearch(request);
            
            // FIX: Handle null results gracefully
            if (results == null) {
                log.warn("VectorStore returned null results for question: {}", question);
                return Collections.emptyList();
            }
            
            long duration = (System.nanoTime() - startedAt) / 1_000_000;
            log.debug("Retrieved {} documents in {} ms", results.size(), duration);
            
            return results;
            
        } catch (Exception e) {
            log.error("Error retrieving documents for question '{}': {}", question, e.getMessage(), e);
            // FIX: Return empty list instead of throwing to keep the service resilient
            return Collections.emptyList();
        }
    }

    /**
     * Retrieve relevant portfolio chunks with a custom topK override.
     * Useful for testing or when you need more/fewer results.
     *
     * @param question The user's question (must not be null or blank)
     * @param topKOverride Override the default topK value
     * @return relevant portfolio chunks
     */
    public List<Document> retrieve(@NonNull String question, int topKOverride) {
        // FIX: Validate input
        if (question == null) {
            throw new IllegalArgumentException("question must not be null");
        }
        if (question.isBlank()) {
            throw new IllegalArgumentException("question must not be blank");
        }
        if (topKOverride <= 0) {
            throw new IllegalArgumentException("topKOverride must be greater than 0");
        }
        
        try {
            Double similarityThreshold = properties.similarityThreshold();
            if (similarityThreshold == null) {
                similarityThreshold = 0.7;
            }
            
            SearchRequest request = SearchRequest.builder()
                    .query(question.trim())
                    .topK(topKOverride)
                    .similarityThreshold(similarityThreshold)
                    .build();
            
            List<Document> results = vectorStore.similaritySearch(request);
            return results != null ? results : Collections.emptyList();
            
        } catch (Exception e) {
            log.error("Error retrieving documents with custom topK: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Check if the knowledge service is ready to handle requests.
     *
     * @return true if the service is ready, false otherwise
     */
    public boolean isReady() {
        try {
            return vectorStore != null && properties != null;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get the current configuration for monitoring/debugging.
     *
     * @return A string describing the current configuration
     */
    public String getConfigInfo() {
        try {
            Integer topK = properties.topK();
            Double threshold = properties.similarityThreshold();
            return String.format("topK=%s, similarityThreshold=%s", 
                    topK != null ? topK : "default(5)", 
                    threshold != null ? threshold : "default(0.7)");
        } catch (Exception e) {
            return "unavailable";
        }
    }

    /**
     * Count the number of documents in the vector store.
     * Useful for monitoring and debugging.
     *
     * @return The number of documents, or -1 if unavailable
     */
    public int documentCount() {
        try {
            // FIX: This is a best-effort attempt since VectorStore doesn't have a count method
            // We can try to search with a dummy query and see what we get
            SearchRequest request = SearchRequest.builder()
                    .query("portfolio")
                    .topK(100) // Try to get as many as possible
                    .similarityThreshold(0.0) // No threshold to get everything
                    .build();
            List<Document> results = vectorStore.similaritySearch(request);
            return results != null ? results.size() : 0;
        } catch (Exception e) {
            log.warn("Unable to count documents: {}", e.getMessage());
            return -1;
        }
    }
}