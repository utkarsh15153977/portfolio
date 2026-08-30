package com.utkarsh.ai.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@Component
public class MockAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(MockAiProvider.class);

    @Override
    public String generateResponse(String userEmail, String conversationId, String message) {
        log.info("MockAiProvider generating response for user={} conversation={}", userEmail, conversationId);

        try {
            long delayMs = 500 + ThreadLocalRandom.current().nextLong(1500);
            TimeUnit.MILLISECONDS.sleep(delayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AiProviderException("PROVIDER_INTERRUPTED", "AI provider was interrupted", e);
        }

        if (ThreadLocalRandom.current().nextDouble() < 0.05) {
            throw new AiProviderException("PROVIDER_TIMEOUT", "Mock AI provider simulated timeout");
        }

        return "This is a mock AI response. Your message was: \"" + message + "\". "
                + "In a real implementation, this would be calling an actual AI provider. "
                + "Processed for user: " + userEmail;
    }
}
