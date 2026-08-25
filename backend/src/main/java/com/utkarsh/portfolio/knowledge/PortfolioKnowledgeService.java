package com.utkarsh.portfolio.knowledge;

import com.utkarsh.portfolio.config.PortfolioRagProperties;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

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

    private final VectorStore vectorStore;
    private final PortfolioRagProperties properties;

    public PortfolioKnowledgeService(VectorStore vectorStore, PortfolioRagProperties properties) {
        this.vectorStore = vectorStore;
        this.properties = properties;
    }

    /**
     * @return relevant portfolio chunks for the question — possibly empty when
     * nothing clears the configured similarity threshold.
     */
    public List<Document> retrieve(String question) {
        SearchRequest request = SearchRequest.builder()
                .query(question)
                .topK(properties.topK())
                .similarityThreshold(properties.similarityThreshold())
                .build();
        return vectorStore.similaritySearch(request);
    }
}
