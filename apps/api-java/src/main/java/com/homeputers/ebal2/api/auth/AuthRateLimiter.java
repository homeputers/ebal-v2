package com.homeputers.ebal2.api.auth;

import com.homeputers.ebal2.api.config.SecurityProperties;
import com.homeputers.ebal2.api.profile.support.RateLimitExceededException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Basic in-memory rate limiter for sensitive auth flows.
 * TODO: replace with centralized gateway-level rate limiting.
 */
@Component
public class AuthRateLimiter {

    private final ConcurrentHashMap<String, RateWindow> loginAttempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, RateWindow> forgotPasswordAttempts = new ConcurrentHashMap<>();
    private final SecurityProperties.RateLimit loginRateLimit;
    private final SecurityProperties.RateLimit forgotPasswordRateLimit;

    public AuthRateLimiter(SecurityProperties securityProperties) {
        this.loginRateLimit = securityProperties.getLoginRateLimit();
        this.forgotPasswordRateLimit = securityProperties.getForgotPasswordRateLimit();
    }

    public void assertLoginAllowed(String key) {
        enforce(loginAttempts, key, loginRateLimit,
                "Too many login attempts. Please try again later.");
    }

    public void resetLoginAttempts(String key) {
        reset(loginAttempts, key);
    }

    public void assertForgotPasswordAllowed(String key) {
        enforce(forgotPasswordAttempts, key, forgotPasswordRateLimit,
                "Too many password reset attempts. Please try again later.");
    }

    public void resetForgotPasswordAttempts(String key) {
        reset(forgotPasswordAttempts, key);
    }

    private void enforce(ConcurrentHashMap<String, RateWindow> store,
                         String key,
                         SecurityProperties.RateLimit config,
                         String message) {
        String normalizedKey = normalizeKey(key);
        store.compute(normalizedKey, (k, current) -> {
            Instant now = Instant.now();
            if (current == null || now.isAfter(current.windowStart().plus(config.getWindow()))) {
                return new RateWindow(now, 1);
            }
            if (current.count() >= config.getMaxAttempts()) {
                throw new RateLimitExceededException(message);
            }
            return new RateWindow(current.windowStart(), current.count() + 1);
        });
    }

    private void reset(ConcurrentHashMap<String, RateWindow> store, String key) {
        store.remove(normalizeKey(key));
    }

    private String normalizeKey(String key) {
        if (!StringUtils.hasText(key)) {
            return "unknown";
        }
        return key.trim();
    }

    private record RateWindow(Instant windowStart, int count) {
    }
}
