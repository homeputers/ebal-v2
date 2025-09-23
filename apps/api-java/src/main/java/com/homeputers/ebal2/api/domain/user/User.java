package com.homeputers.ebal2.api.domain.user;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

public record User(
        UUID id,
        String email,
        String displayName,
        String passwordHash,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        int version
) {
    public User {
        if (id == null) {
            id = UUID.randomUUID();
        }
        email = normalizeEmail(email);
        displayName = normalizeDisplayName(displayName, email);
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = createdAt;
        }
        if (version < 0) {
            version = 0;
        }
    }

    private static String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizeDisplayName(String displayName, String email) {
        String value = displayName;
        if (value != null) {
            value = value.trim();
        }
        if (!hasText(value) && email != null) {
            value = email;
        }
        return Objects.requireNonNullElse(value, "");
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}

