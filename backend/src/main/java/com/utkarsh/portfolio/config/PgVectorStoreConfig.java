package com.utkarsh.portfolio.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Phase 4.3 production vector-store wiring: PostgreSQL + pgvector.
 *
 * Activated only when portfolio.ai.rag.store-type=pgvector. The DataSource is
 * constructed manually from environment-driven properties (Spring's
 * DataSourceAutoConfiguration is excluded in application.yml) so that the
 * zero-infra file mode never accidentally demands database configuration.
 *
 * Schema (table + HNSW index) is created by PgVectorStore itself via
 * initializeSchema(true). The pgvector EXTENSION must already be installed on
 * the target database (CREATE EXTENSION vector;) — documented in README.
 *
 * Credentials arrive exclusively through environment variables; nothing is
 * hardcoded and nothing is exposed to the frontend.
 */
@Configuration
@Conditional(RagStoreConditions.PgVector.class)
public class PgVectorStoreConfig {

    private static final Logger log = LoggerFactory.getLogger(PgVectorStoreConfig.class);

    private static final int DEFAULT_MAX_POOL_SIZE = 4;
    private static final int DEFAULT_CONNECTION_TIMEOUT = 10000;
    private static final int DEFAULT_INIT_FAIL_TIMEOUT = 10000;

    @Bean
    public HikariDataSource portfolioVectorDataSource(@NonNull PortfolioRagProperties properties) {
        // FIX: Add null check
        if (properties == null) {
            throw new IllegalArgumentException("PortfolioRagProperties must not be null");
        }
        
        // FIX: Enhanced validation with null-safe access
        String pgUrl = properties.pgUrl();
        String pgUsername = properties.pgUsername();
        
        if (pgUrl == null || pgUrl.isBlank()) {
            throw new IllegalStateException(
                    "store-type=pgvector requires PORTFOLIO_AI_PGVECTOR_URL environment variable");
        }
        if (pgUsername == null || pgUsername.isBlank()) {
            throw new IllegalStateException(
                    "store-type=pgvector requires PORTFOLIO_AI_PGVECTOR_USERNAME environment variable");
        }
        
        // FIX: Get password with null handling
        String pgPassword = properties.pgPassword();
        if (pgPassword == null) {
            pgPassword = "";
            log.warn("Password for pgvector is not set or is empty");
        }
        
        log.info("Initializing pgvector datasource for database: {}", sanitizeUrl(pgUrl));
        
        try {
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(pgUrl);
            config.setUsername(pgUsername);
            config.setPassword(pgPassword);
            config.setMaximumPoolSize(DEFAULT_MAX_POOL_SIZE);
            config.setPoolName("portfolio-vector-pool");
            config.setConnectionTimeout(DEFAULT_CONNECTION_TIMEOUT);
            config.setInitializationFailTimeout(DEFAULT_INIT_FAIL_TIMEOUT);
            
            // FIX: Add validation query to ensure connection is healthy
            config.setConnectionTestQuery("SELECT 1");
            
            // FIX: Add additional performance settings
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
            
            HikariDataSource dataSource = new HikariDataSource(config);
            log.info("Pgvector datasource initialized successfully");
            return dataSource;
            
        } catch (Exception e) {
            log.error("Failed to create pgvector datasource: {}", e.getMessage(), e);
            throw new IllegalStateException("Failed to initialize pgvector datasource: " + e.getMessage(), e);
        }
    }

    @Bean
    public JdbcTemplate portfolioVectorJdbcTemplate(@NonNull HikariDataSource dataSource) {
        // FIX: Add null check
        if (dataSource == null) {
            throw new IllegalArgumentException("HikariDataSource must not be null");
        }
        
        log.debug("Creating JdbcTemplate for vector store");
        return new JdbcTemplate(dataSource);
    }

    @Bean
    public VectorStore vectorStore(@NonNull JdbcTemplate jdbcTemplate,
                                   @NonNull EmbeddingModel embeddingModel,
                                   @NonNull PortfolioRagProperties properties) {
        // FIX: Add null checks
        if (jdbcTemplate == null) {
            throw new IllegalArgumentException("JdbcTemplate must not be null");
        }
        if (embeddingModel == null) {
            throw new IllegalArgumentException("EmbeddingModel must not be null");
        }
        if (properties == null) {
            throw new IllegalArgumentException("PortfolioRagProperties must not be null");
        }
        
        // FIX: Safely get dimensions with fallback
        Integer dimensions = properties.dimensions();
        if (dimensions == null) {
            dimensions = 384; // Default fallback for most embedding models
            log.warn("Dimensions property is null, using default: {}", dimensions);
        }
        
        // FIX: Safely get table name with fallback
        String tableName = properties.pgTable();
        if (tableName == null || tableName.isBlank()) {
            tableName = "vector_store";
            log.warn("Table name is null/blank, using default: {}", tableName);
        }
        
        log.info("Creating pgvector store with dimensions={}, table={}, schema initialization={}", 
                dimensions, tableName, true);
        
        try {
            VectorStore vectorStore = PgVectorStore.builder(jdbcTemplate, embeddingModel)
                    .dimensions(dimensions)
                    .vectorTableName(tableName)
                    .initializeSchema(true)
                    .build();
            
            log.info("PgVectorStore initialized successfully");
            return vectorStore;
            
        } catch (Exception e) {
            log.error("Failed to create PgVectorStore: {}", e.getMessage(), e);
            throw new IllegalStateException("Failed to initialize PgVectorStore: " + e.getMessage(), e);
        }
    }

    /**
     * Sanitize a database URL to hide sensitive information for logging.
     * 
     * @param url The database URL
     * @return A sanitized version of the URL
     */
    private String sanitizeUrl(String url) {
        if (url == null) {
            return "unknown";
        }
        try {
            // Remove credentials from URL for logging
            java.net.URI uri = new java.net.URI(url);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            int port = uri.getPort();
            String path = uri.getPath();
            
            StringBuilder sanitized = new StringBuilder();
            sanitized.append(scheme != null ? scheme : "jdbc")
                    .append("://");
            if (host != null) {
                sanitized.append(host);
                if (port > 0) {
                    sanitized.append(":").append(port);
                }
            } else {
                sanitized.append("unknown-host");
            }
            if (path != null && !path.isBlank()) {
                sanitized.append(path);
            }
            return sanitized.toString();
            
        } catch (Exception e) {
            // If we can't parse the URL, just return a generic message
            return "database";
        }
    }

    /**
     * Validate that all required configuration is present.
     * Useful for health checks.
     *
     * @param properties The properties to validate
     * @return true if configuration is valid, false otherwise
     */
    public boolean isConfigValid(PortfolioRagProperties properties) {
        try {
            if (properties == null) {
                return false;
            }
            String url = properties.pgUrl();
            String username = properties.pgUsername();
            String password = properties.pgPassword();
            Integer dimensions = properties.dimensions();
            
            return url != null && !url.isBlank()
                    && username != null && !username.isBlank()
                    && password != null
                    && dimensions != null && dimensions > 0;
        } catch (Exception e) {
            return false;
        }
    }
}