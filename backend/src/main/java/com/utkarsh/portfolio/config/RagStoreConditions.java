package com.utkarsh.portfolio.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * Store-backend selection conditions for Phase 4.3.
 *
 * A backend configuration activates only when RAG is enabled AND the
 * configured store-type selects that backend.
 */
public final class RagStoreConditions {

    private RagStoreConditions() {
    }

    private static boolean storeTypeIs(ConditionContext context, AnnotatedTypeMetadata metadata, String type) {
        boolean enabled = Boolean.parseBoolean(
                context.getEnvironment().getProperty("portfolio.ai.rag.enabled", "true"));
        String storeType = context.getEnvironment()
                .getProperty("portfolio.ai.rag.store-type", "file");
        return enabled && storeType.equalsIgnoreCase(type);
    }

    /** Zero-infra file-backed SimpleVectorStore (default). */
    public static class File implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            return storeTypeIs(context, metadata, "file");
        }
    }

    /** Production PostgreSQL + pgvector backend. */
    public static class PgVector implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            return storeTypeIs(context, metadata, "pgvector");
        }
    }
}
