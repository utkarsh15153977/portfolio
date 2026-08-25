package com.utkarsh.portfolio.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Builds the single {@link ChatClient} used by the portfolio backend.
 *
 * The system prompt is applied as the client default so every call is grounded
 * in honest portfolio content: production experience is Java/Spring/distributed
 * systems; AI-related work must be presented as exploration or future direction,
 * never as professional experience.
 *
 * Phase 4.2+ will add retrieval (RAG) via advisors without changing this shape.
 */
@Configuration
public class AiClientConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder, PortfolioAiProperties properties) {
        return builder
                .defaultSystem(properties.systemPrompt())
                .build();
    }
}
