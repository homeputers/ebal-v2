package com.homeputers.ebal2.api.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class AuthAuditLogger {

    private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("AuthAudit");
    private static final int MAX_USER_AGENT_LENGTH = 200;

    public void loginSuccess(String email, String ipAddress, String userAgent) {
        AUDIT_LOGGER.info("LOGIN_SUCCESS email={} ip={} userAgent={}",
                normalizeEmail(email), safeIp(ipAddress), safeUserAgent(userAgent));
    }

    public void loginFailure(String email, String ipAddress, String userAgent) {
        AUDIT_LOGGER.warn("LOGIN_FAILURE email={} ip={} userAgent={}",
                normalizeEmail(email), safeIp(ipAddress), safeUserAgent(userAgent));
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return "<unknown>";
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String safeIp(String ipAddress) {
        return ipAddress == null || ipAddress.isBlank() ? "<unknown>" : ipAddress.trim();
    }

    private String safeUserAgent(String userAgent) {
        if (userAgent == null) {
            return "<unknown>";
        }
        String trimmed = userAgent.trim();
        if (trimmed.length() <= MAX_USER_AGENT_LENGTH) {
            return trimmed;
        }
        return trimmed.substring(0, MAX_USER_AGENT_LENGTH);
    }
}
