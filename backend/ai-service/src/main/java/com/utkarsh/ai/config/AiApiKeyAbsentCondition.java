package com.utkarsh.ai.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class AiApiKeyAbsentCondition implements Condition {

    private static final Logger log = LoggerFactory.getLogger(AiApiKeyAbsentCondition.class);

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String key = context.getEnvironment().getProperty("ai.openai.api-key");
        boolean absent = key == null || key.isBlank();
        if (absent) {
            log.warn("AI_API_KEY not configured, using MockAiProvider");
        }
        return absent;
    }
}
