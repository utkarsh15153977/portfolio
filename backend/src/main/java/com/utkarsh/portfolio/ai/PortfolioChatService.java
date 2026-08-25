package com.utkarsh.portfolio.ai;

import com.utkarsh.portfolio.config.PortfolioAiProperties;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

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

    static final String NO_CONTEXT_PLACEHOLDER =
            "(no matching portfolio knowledge found for this question)";

    private final ChatClient chatClient;
    private final String baseSystemPrompt;
    private final ObjectProvider<PortfolioKnowledgeService> knowledgeProvider;

    public PortfolioChatService(ChatClient chatClient,
                                PortfolioAiProperties properties,
                                ObjectProvider<PortfolioKnowledgeService> knowledgeProvider) {
        this.chatClient = chatClient;
        this.baseSystemPrompt = properties.systemPrompt();
        this.knowledgeProvider = knowledgeProvider;
    }

    public String answer(String message) {
        String contextBlock = buildContextBlock(message);
        String systemPrompt = baseSystemPrompt + "\n\n" + groundingRules() + "\n\n"
                + "RETRIEVED PORTFOLIO CONTEXT:\n" + contextBlock;

        return chatClient.prompt()
                .system(systemPrompt)
                .user(message)
                .call()
                .content();
    }

    private String buildContextBlock(String question) {
        PortfolioKnowledgeService knowledge = knowledgeProvider.getIfAvailable();
        if (knowledge == null) {
            return NO_CONTEXT_PLACEHOLDER;
        }
        List<org.springframework.ai.document.Document> hits = knowledge.retrieve(question);
        if (hits.isEmpty()) {
            return NO_CONTEXT_PLACEHOLDER;
        }
        StringBuilder sb = new StringBuilder();
        for (org.springframework.ai.document.Document doc : hits) {
            sb.append("- [")
                    .append(doc.getMetadata().getOrDefault(PortfolioKnowledgeLoader.META_SECTION, "unknown"))
                    .append(" / ")
                    .append(doc.getMetadata().getOrDefault(PortfolioKnowledgeLoader.META_TITLE, "unknown"))
                    .append("]\n")
                    .append(doc.getText())
                    .append("\n\n");
        }
        return sb.toString();
    }

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
                or future direction, never professional production experience.""";
    }
}
