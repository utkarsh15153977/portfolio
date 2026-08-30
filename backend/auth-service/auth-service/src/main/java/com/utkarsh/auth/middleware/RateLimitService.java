package com.utkarsh.auth.middleware;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.ratelimit.login.max-attempts:5}")
    private int loginMaxAttempts;

    @Value("${app.ratelimit.login.window-seconds:900}")
    private int loginWindowSeconds;

    @Value("${app.ratelimit.register.max-attempts:5}")
    private int registerMaxAttempts;

    @Value("${app.ratelimit.register.window-seconds:3600}")
    private int registerWindowSeconds;

    public RateLimitService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isLoginAllowed(String ip) {
        return isAllowed("auth:ratelimit:login:", ip, loginMaxAttempts, loginWindowSeconds);
    }

    public boolean isRegisterAllowed(String ip) {
        return isAllowed("auth:ratelimit:register:", ip, registerMaxAttempts, registerWindowSeconds);
    }

    private boolean isAllowed(String prefix, String identifier, int maxAttempts, int windowSeconds) {
        try {
            String key = prefix + identifier;
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) {
                redisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
            }
            return count == null || count <= maxAttempts;
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, allowing request (fail-open)");
            return true;
        } catch (Exception e) {
            log.warn("Rate limit check failed: {}", e.getMessage());
            return true;
        }
    }

    public void recordFailedLogin(String ip) {
        try {
            String key = "auth:ratelimit:login:fail:" + ip;
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) {
                redisTemplate.expire(key, loginWindowSeconds, TimeUnit.SECONDS);
            }
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, cannot record failed login");
        } catch (Exception e) {
            log.warn("Failed login recording failed: {}", e.getMessage());
        }
    }

    public boolean isLoginBlocked(String ip) {
        try {
            String key = "auth:ratelimit:login:fail:" + ip;
            String count = redisTemplate.opsForValue().get(key);
            if (count != null && Integer.parseInt(count) >= loginMaxAttempts) {
                return true;
            }
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, cannot check login block");
        } catch (Exception e) {
            log.warn("Login block check failed: {}", e.getMessage());
        }
        return false;
    }
}
