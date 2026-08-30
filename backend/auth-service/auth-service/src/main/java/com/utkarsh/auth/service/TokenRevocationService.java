package com.utkarsh.auth.service;

import com.utkarsh.auth.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class TokenRevocationService {

    private static final Logger log = LoggerFactory.getLogger(TokenRevocationService.class);
    private static final String PREFIX = "auth:revoked:";

    private final RedisTemplate<String, String> redisTemplate;
    private final JwtService jwtService;

    public TokenRevocationService(RedisTemplate<String, String> redisTemplate, JwtService jwtService) {
        this.redisTemplate = redisTemplate;
        this.jwtService = jwtService;
    }

    public void revoke(String token) {
        try {
            String hash = jwtService.getTokenHash(token);
            long remainingMs = jwtService.getTokenRemainingLifetimeMs(token);
            if (remainingMs > 0) {
                redisTemplate.opsForValue().set(PREFIX + hash, "true", remainingMs, TimeUnit.MILLISECONDS);
            }
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, cannot revoke token");
        } catch (Exception e) {
            log.warn("Token revocation failed: {}", e.getMessage());
        }
    }

    public boolean isRevoked(String token) {
        try {
            String hash = jwtService.getTokenHash(token);
            return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + hash));
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, skipping revoked token check");
            return false;
        } catch (Exception e) {
            log.warn("Revocation check failed: {}", e.getMessage());
            return false;
        }
    }
}
