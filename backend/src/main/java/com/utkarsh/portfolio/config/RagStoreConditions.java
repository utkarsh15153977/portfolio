package com.utkarsh.portfolio.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.lang.NonNull;

/**
 * Store-backend selection conditions for Phase 4.3.
 *
 * A backend configuration activates only when RAG is enabled AND the
 * configured store-type selects that backend.
 */
public final class RagStoreConditions {

    private static final Logger log = LoggerFactory.getLogger(RagStoreConditions.class);

    private static final String RAG_ENABLED_PROPERTY = "portfolio.ai.rag.enabled";
    private static final String STORE_TYPE_PROPERTY = "portfolio.ai.rag.store-type";
    private static final String DEFAULT_RAG_ENABLED = "true";
    private static final String DEFAULT_STORE_TYPE = "file";

    private RagStoreConditions() {
        // Private constructor to prevent instantiation
    }

    /**
     * Check if the store type matches the configured value.
     * Includes null safety for all parameters.
     *
     * @param context The condition context (may be null)
     * @param metadata The annotated type metadata (may be null)
     * @param type The expected store type (may be null)
     * @return true if the store type matches, false otherwise
     */
    private static boolean storeTypeIs(ConditionContext context, AnnotatedTypeMetadata metadata, String type) {
        // FIX: Add null checks
        if (context == null) {
            log.warn("ConditionContext is null, returning false");
            return false;
        }
        if (type == null || type.isBlank()) {
            log.warn("Store type is null or blank, returning false");
            return false;
        }

        try {
            // FIX: Safely get environment with null check
            var environment = context.getEnvironment();
            if (environment == null) {
                log.warn("Environment is null, returning false");
                return false;
            }

            // FIX: Safely get properties with null handling and defaults
            String enabledProperty = environment.getProperty(RAG_ENABLED_PROPERTY);
            boolean enabled = parseBoolean(enabledProperty, DEFAULT_RAG_ENABLED);

            String storeType = environment.getProperty(STORE_TYPE_PROPERTY);
            if (storeType == null || storeType.isBlank()) {
                storeType = DEFAULT_STORE_TYPE;
            }

            boolean result = enabled && storeType.equalsIgnoreCase(type);
            
            // FIX: Add debug logging for troubleshooting
            if (log.isDebugEnabled()) {
                log.debug("Store type check: enabled={}, configured={}, expected={}, result={}", 
                        enabled, storeType, type, result);
            }
            
            return result;

        } catch (Exception e) {
            log.warn("Error checking store type condition: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Safely parse a boolean property with a default fallback.
     *
     * @param value The string value to parse (may be null)
     * @param defaultValue The default value as a string
     * @return The parsed boolean value
     */
    private static boolean parseBoolean(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return Boolean.parseBoolean(defaultValue);
        }
        return Boolean.parseBoolean(value);
    }

    /** Zero-infra file-backed SimpleVectorStore (default). */
    public static class File implements Condition {
        @Override
        public boolean matches(@NonNull ConditionContext context, @NonNull AnnotatedTypeMetadata metadata) {
            // FIX: Add null checks with proper logging
            if (context == null || metadata == null) {
                log.warn("File condition: Context or metadata is null");
                return false;
            }
            return storeTypeIs(context, metadata, "file");
        }
    }

    /** Production PostgreSQL + pgvector backend. */
    public static class PgVector implements Condition {
        @Override
        public boolean matches(@NonNull ConditionContext context, @NonNull AnnotatedTypeMetadata metadata) {
            // FIX: Add null checks with proper logging
            if (context == null || metadata == null) {
                log.warn("PgVector condition: Context or metadata is null");
                return false;
            }
            return storeTypeIs(context, metadata, "pgvector");
        }
    }

    /**
     * Helper method to check if RAG is enabled.
     * Useful for other components that need to know the RAG status.
     *
     * @param context The condition context (may be null)
     * @return true if RAG is enabled, false otherwise
     */
    public static boolean isRagEnabled(ConditionContext context) {
        if (context == null) {
            return false;
        }

        try {
            var environment = context.getEnvironment();
            if (environment == null) {
                return false;
            }

            String enabledProperty = environment.getProperty(RAG_ENABLED_PROPERTY);
            return parseBoolean(enabledProperty, DEFAULT_RAG_ENABLED);

        } catch (Exception e) {
            log.warn("Error checking RAG enabled status: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get the configured store type.
     * Useful for other components that need to know the store type.
     *
     * @param context The condition context (may be null)
     * @return The store type, or the default "file" if not configured
     */
    public static String getStoreType(ConditionContext context) {
        if (context == null) {
            return DEFAULT_STORE_TYPE;
        }

        try {
            var environment = context.getEnvironment();
            if (environment == null) {
                return DEFAULT_STORE_TYPE;
            }

            String storeType = environment.getProperty(STORE_TYPE_PROPERTY);
            return storeType != null && !storeType.isBlank() ? storeType : DEFAULT_STORE_TYPE;

        } catch (Exception e) {
            log.warn("Error getting store type: {}", e.getMessage());
            return DEFAULT_STORE_TYPE;
        }
    }

    /**
     * Check if a specific store type is configured.
     *
     * @param context The condition context (may be null)
     * @param type The store type to check (may be null)
     * @return true if the configured store type matches, false otherwise
     */
    public static boolean isStoreType(ConditionContext context, String type) {
        if (context == null || type == null || type.isBlank()) {
            return false;
        }

        try {
            String configuredType = getStoreType(context);
            return configuredType.equalsIgnoreCase(type);
        } catch (Exception e) {
            log.warn("Error checking store type: {}", e.getMessage());
            return false;
        }
    }
}