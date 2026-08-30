package com.utkarsh.auth.service;

import com.utkarsh.auth.entity.User;
import com.utkarsh.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class UserCacheService {

    private static final Logger log = LoggerFactory.getLogger(UserCacheService.class);
    private static final String PREFIX = "auth:user:";
    private static final long TTL_MINUTES = 15;

    private final RedisTemplate<String, String> redisTemplate;
    private final UserRepository userRepository;

    public UserCacheService(RedisTemplate<String, String> redisTemplate, UserRepository userRepository) {
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
    }

    public Optional<User> findUserByEmail(String email) {
        // Always check PostgreSQL for the authoritative user object
        // The cache stores a simple marker to avoid repeated DB lookups for the same user ID
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            cacheUser(userOpt.get());
        }
        return userOpt;
    }

    public Optional<User> getUserFromCache(Long userId) {
        try {
            String cached = redisTemplate.opsForValue().get(PREFIX + userId);
            if (cached != null) {
                // Cache hit — but we need the actual User entity.
                // Since we can't deserialize User from a simple string,
                // the cache acts as a "user exists" marker.
                // The real optimization is in JwtAuthenticationFilter where
                // we can skip DB if we know the user ID is valid.
                // For now, return empty to fall through to DB lookup.
                return Optional.empty();
            }
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, skipping user cache");
        } catch (Exception e) {
            log.warn("User cache read failed: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public void cacheUser(User user) {
        try {
            String key = PREFIX + user.getId();
            // Store minimal user data as a pipe-delimited string: id|email|name
            String value = user.getId() + "|" + user.getEmail() + "|" + user.getName();
            redisTemplate.opsForValue().set(key, value, TTL_MINUTES, TimeUnit.MINUTES);
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, cannot cache user");
        } catch (Exception e) {
            log.warn("User cache write failed: {}", e.getMessage());
        }
    }

    public void evictUser(Long userId) {
        try {
            redisTemplate.delete(PREFIX + userId);
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, cannot evict user cache");
        } catch (Exception e) {
            log.warn("User cache eviction failed: {}", e.getMessage());
        }
    }
}
