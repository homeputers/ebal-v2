package com.homeputers.ebal2.api.config;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;
import java.util.stream.Stream;

@ConfigurationProperties("ebal.security")
@Validated
public class SecurityProperties {

    private boolean enabled = true;
    private final Cors cors = new Cors();
    private final Jwt jwt = new Jwt();
    private final PasswordReset passwordReset = new PasswordReset();
    private final RateLimit loginRateLimit = new RateLimit(10, Duration.ofMinutes(1));
    private final RateLimit forgotPasswordRateLimit = new RateLimit(5, Duration.ofMinutes(15));

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Cors getCors() {
        return cors;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public PasswordReset getPasswordReset() {
        return passwordReset;
    }

    public RateLimit getLoginRateLimit() {
        return loginRateLimit;
    }

    public RateLimit getForgotPasswordRateLimit() {
        return forgotPasswordRateLimit;
    }

    public static class Cors {
        private String devOrigin;
        private String prodOrigin;

        public String getDevOrigin() {
            return devOrigin;
        }

        public void setDevOrigin(String devOrigin) {
            this.devOrigin = devOrigin;
        }

        public String getProdOrigin() {
            return prodOrigin;
        }

        public void setProdOrigin(String prodOrigin) {
            this.prodOrigin = prodOrigin;
        }

        public List<String> getAllowedOrigins() {
            return Stream.of(devOrigin, prodOrigin)
                    .filter(origin -> origin != null && !origin.isBlank())
                    .distinct()
                    .toList();
        }
    }

    public static class Jwt {
        @NotBlank
        private String secret;
        private Duration accessTokenTtl = Duration.ofMinutes(15);
        private Duration refreshTokenTtl = Duration.ofDays(30);

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public Duration getAccessTokenTtl() {
            return accessTokenTtl;
        }

        public void setAccessTokenTtl(Duration accessTokenTtl) {
            this.accessTokenTtl = accessTokenTtl;
        }

        public Duration getRefreshTokenTtl() {
            return refreshTokenTtl;
        }

        public void setRefreshTokenTtl(Duration refreshTokenTtl) {
            this.refreshTokenTtl = refreshTokenTtl;
        }

        @AssertTrue(message = "JWT secret must be at least 64 characters long")
        public boolean isSecretStrongEnough() {
            return secret != null && secret.length() >= 64;
        }

        @AssertTrue(message = "Access token TTL must be positive")
        public boolean isAccessTtlPositive() {
            return accessTokenTtl != null && !accessTokenTtl.isNegative() && !accessTokenTtl.isZero();
        }

        @AssertTrue(message = "Refresh token TTL must be positive")
        public boolean isRefreshTtlPositive() {
            return refreshTokenTtl != null && !refreshTokenTtl.isNegative() && !refreshTokenTtl.isZero();
        }
    }

    public static class PasswordReset {
        private Duration ttl = Duration.ofMinutes(60);

        public Duration getTtl() {
            return ttl;
        }

        public void setTtl(Duration ttl) {
            this.ttl = ttl;
        }

        @AssertTrue(message = "Password reset TTL must be positive")
        public boolean isTtlPositive() {
            return ttl != null && !ttl.isNegative() && !ttl.isZero();
        }
    }

    public static class RateLimit {
        @Min(1)
        private int maxAttempts;

        @NotNull
        private Duration window;

        public RateLimit() {
            this(5, Duration.ofMinutes(1));
        }

        public RateLimit(int maxAttempts, Duration window) {
            this.maxAttempts = maxAttempts;
            this.window = window;
        }

        public int getMaxAttempts() {
            return maxAttempts;
        }

        public void setMaxAttempts(int maxAttempts) {
            this.maxAttempts = maxAttempts;
        }

        public Duration getWindow() {
            return window;
        }

        public void setWindow(Duration window) {
            this.window = window;
        }

        @AssertTrue(message = "window must be positive")
        public boolean isWindowPositive() {
            return window != null && !window.isNegative() && !window.isZero();
        }
    }
}
