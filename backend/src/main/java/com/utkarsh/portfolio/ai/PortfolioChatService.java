package com.utkarsh.portfolio.ai;

import com.utkarsh.portfolio.config.PortfolioAiProperties;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Phase 4.2 — RAG chat flow.
 *
 * user question
 *      ↓ retrieve relevant portfolio knowledge (vector similarity)
 *      ↓ compose grounded context block with section/title/source metadata
 *      ↓ ChatClient (system rules + retrieved context + question)
 *      ↓ answer grounded in the retrieved portfolio data
 *
 * The model is explicitly instructed to answer ONLY from the retrieved
 * context, to never invent experience/projects/education/achievements, and to
 * say clearly when information is not available. Production experience and AI
 * exploration/future direction remain strictly separated.
 *
 * The response contract from Phase 4.1 is unchanged: plain answer text wrapped
 * by the controller as { answer, source: "portfolio" }.
 */
@Service
public class PortfolioChatService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioChatService.class);

    static final String NO_CONTEXT_PLACEHOLDER =
            "(no matching portfolio knowledge found for this question)";

    private final ChatClient chatClient;
    private final String baseSystemPrompt;
    private final ObjectProvider<PortfolioKnowledgeService> knowledgeProvider;

    public PortfolioChatService(@NonNull ChatClient chatClient,
                                @NonNull PortfolioAiProperties properties,
                                @NonNull ObjectProvider<PortfolioKnowledgeService> knowledgeProvider) {
        // FIX: Add null checks for all dependencies
        if (chatClient == null) {
            throw new IllegalArgumentException("ChatClient must not be null");
        }
        if (properties == null) {
            throw new IllegalArgumentException("PortfolioAiProperties must not be null");
        }
        if (knowledgeProvider == null) {
            throw new IllegalArgumentException("ObjectProvider must not be null");
        }
        
        this.chatClient = chatClient;
        this.baseSystemPrompt = properties.systemPrompt();
        this.knowledgeProvider = knowledgeProvider;
    }

    /**
     * Process a user message through the RAG chat flow.
     *
     * @param message The user's message/question (must not be null or blank)
     * @return The grounded answer based on portfolio knowledge
     * @throws IllegalArgumentException if message is null or blank
     * @throws RuntimeException if the chat request fails
     */
    public String answer(@NonNull String message) {
        // FIX: Enhanced null/blank check
        if (message == null) {
            throw new IllegalArgumentException("message must not be null");
        }
        if (message.isBlank()) {
            throw new IllegalArgumentException("message must not be blank");
        }
        
        long startedAt = System.nanoTime();
        log.info("Chat request started (chars={})", message.length());
        
        try {
            // FIX: Safely build the context block
            String contextBlock = buildContextBlock(message);
            
            // FIX: Safely build the system prompt with null handling
            String systemPrompt = buildSystemPrompt(contextBlock);
            
            String answer = chatClient.prompt()
                    .system(systemPrompt)
                    .user(message.strip())
                    .call()
                    .content();
            
            // FIX: Handle null response gracefully
            if (answer == null) {
                log.warn("Chat service returned null response");
                return "I apologize, but I couldn't generate a response. Please try again.";
            }
            
            log.info("Chat request completed in {} ms (answerChars={})",
                    (System.nanoTime() - startedAt) / 1_000_000,
                    answer.length());
            return answer;
            
        } catch (RuntimeException e) {
            log.warn("Chat request failed after {} ms: {}",
                    (System.nanoTime() - startedAt) / 1_000_000,
                    e.getClass().getSimpleName());
            throw e;
        }
    }

    /**
     * Build the context block by retrieving relevant portfolio knowledge.
     * Includes null safety for all operations.
     *
     * @param question The user's question
     * @return A formatted context block with retrieved knowledge
     */
    private String buildContextBlock(String question) {
        // FIX: Validate input
        if (question == null || question.isBlank()) {
            return NO_CONTEXT_PLACEHOLDER;
        }
        
        try {
            // FIX: Get knowledge service with null check
            PortfolioKnowledgeService knowledge = knowledgeProvider.getIfAvailable();
            if (knowledge == null) {
                log.warn("PortfolioKnowledgeService is not available");
                return NO_CONTEXT_PLACEHOLDER;
            }
            
            // FIX: Safely retrieve documents
            List<Document> hits = knowledge.retrieve(question);
            if (hits == null || hits.isEmpty()) {
                log.debug("No documents found for question: {}", question);
                return NO_CONTEXT_PLACEHOLDER;
            }
            
            // FIX: Build context with null-safe metadata access
            StringBuilder sb = new StringBuilder();
            for (Document doc : hits) {
                if (doc == null) {
                    continue;
                }
                
                // FIX: Safely get metadata with defaults
                var metadata = doc.getMetadata();
                if (metadata == null) {
                    sb.append("- [unknown / unknown]\n")
                      .append(doc.getText() != null ? doc.getText() : "")
                      .append("\n\n");
                    continue;
                }
                
                String section = getMetadataValue(metadata, PortfolioKnowledgeLoader.META_SECTION, "unknown");
                String title = getMetadataValue(metadata, PortfolioKnowledgeLoader.META_TITLE, "unknown");
                String text = doc.getText();
                
                sb.append("- [")
                  .append(section)
                  .append(" / ")
                  .append(title)
                  .append("]\n")
                  .append(text != null ? text : "")
                  .append("\n\n");
            }
            
            String result = sb.toString();
            return result.isBlank() ? NO_CONTEXT_PLACEHOLDER : result;
            
        } catch (Exception e) {
            log.warn("Failed to build context block: {}", e.getMessage());
            return NO_CONTEXT_PLACEHOLDER;
        }
    }

    /**
     * Safely get a value from metadata with a default fallback.
     *
     * @param metadata The metadata map (may be null)
     * @param key The key to look up
     * @param defaultValue The default value if key is not found or metadata is null
     * @return The metadata value or default
     */
    private String getMetadataValue(java.util.Map<String, Object> metadata, String key, String defaultValue) {
        if (metadata == null || !metadata.containsKey(key)) {
            return defaultValue;
        }
        Object value = metadata.get(key);
        return value != null ? value.toString() : defaultValue;
    }

    /**
     * Build the complete system prompt by combining base prompt, grounding rules,
     * and the retrieved context.
     *
     * @param contextBlock The retrieved context block
     * @return The complete system prompt
     */
    private String buildSystemPrompt(String contextBlock) {
        // FIX: Safely get base prompt with default
        String base = baseSystemPrompt;
        if (base == null) {
            base = "You are a helpful portfolio assistant for Utkarsh Singh.";
        }
        
        return base + "\n\n" + groundingRules() + "\n\n"
                + "RETRIEVED PORTFOLIO CONTEXT:\n" 
                + (contextBlock != null ? contextBlock : NO_CONTEXT_PLACEHOLDER);
    }

    /**
     * Get the grounding rules for the AI model.
     * These rules ensure answers are grounded in retrieved context.
     *
     * @return The grounding rules as a string
     */
    private static String groundingRules() {
        return """
                GROUNDING RULES for this answer:
                1. When discussing portfolio facts (experience, projects, skills, education, \
                architecture, interests), use ONLY the RETRIEVED PORTFOLIO CONTEXT below.
                2. Never invent employers, projects, technologies, metrics, education or achievements.
                3. If the retrieved context does not contain the requested information, state \
                clearly that this information is not available in the portfolio.
                4. Keep the honest distinction: production experience = Java/Spring/distributed \
                systems work; anything AI-related (LLMs, RAG, agents, Spring AI) is exploration \
                or future direction, never professional production experience.
                5. Be concise and technical in your responses.
                6. If the context contains conflicting information, prioritize the most recent or \
                most relevant information.""";
    }

    /**
     * Check if the chat service is properly initialized and ready to handle requests.
     *
     * @return true if the service is ready, false otherwise
     */
    public boolean isReady() {
        try {
            return chatClient != null && knowledgeProvider != null;
        } catch (Exception e) {
            return false;
        }
    }
}