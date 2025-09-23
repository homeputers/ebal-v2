package com.homeputers.ebal2.api.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@ConfigurationProperties("ebal.profile")
@Validated
public class SelfServiceProperties {

    private final Avatar avatar = new Avatar();
    private final EmailChange emailChange = new EmailChange();
    private final RateLimit rateLimit = new RateLimit();

    public Avatar getAvatar() {
        return avatar;
    }

    public EmailChange getEmailChange() {
        return emailChange;
    }

    public RateLimit getRateLimit() {
        return rateLimit;
    }

    public static class Avatar {
        @NotBlank
        private String storagePath = "uploads/avatars";

        @NotBlank
        private String publicBaseUrl = "/static/avatars/";

        @Min(1)
        private long maxSizeBytes = 2 * 1024 * 1024;

        public String getStoragePath() {
            return storagePath;
        }

        public void setStoragePath(String storagePath) {
            this.storagePath = storagePath;
        }

        public String getPublicBaseUrl() {
            return publicBaseUrl;
        }

        public void setPublicBaseUrl(String publicBaseUrl) {
            this.publicBaseUrl = publicBaseUrl;
        }

        public long getMaxSizeBytes() {
            return maxSizeBytes;
        }

        public void setMaxSizeBytes(long maxSizeBytes) {
            this.maxSizeBytes = maxSizeBytes;
        }
    }

    public static class EmailChange {
        @Positive
        private Duration ttl = Duration.ofMinutes(60);

        public Duration getTtl() {
            return ttl;
        }

        public void setTtl(Duration ttl) {
            this.ttl = ttl;
        }
    }

    public static class RateLimit {
        @Min(1)
        private int maxAttempts = 5;

        @Positive
        private Duration window = Duration.ofMinutes(5);

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
    }
}
