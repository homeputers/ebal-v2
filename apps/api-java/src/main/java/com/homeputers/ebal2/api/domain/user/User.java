package com.homeputers.ebal2.api.domain.user;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

public record User(
        UUID id,
        String email,
        String passwordHash,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public User {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (email != null) {
            email = email.trim().toLowerCase(Locale.ROOT);
        }
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = createdAt;
        }
    }
}

