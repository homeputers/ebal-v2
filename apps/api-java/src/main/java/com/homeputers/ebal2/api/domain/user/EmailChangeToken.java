package com.homeputers.ebal2.api.domain.user;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

public record EmailChangeToken(
        UUID id,
        UUID userId,
        String newEmail,
        String token,
        OffsetDateTime expiresAt,
        OffsetDateTime usedAt,
        OffsetDateTime createdAt
) {
    public EmailChangeToken {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (newEmail != null) {
            newEmail = newEmail.trim().toLowerCase(Locale.ROOT);
        }
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(OffsetDateTime.now());
    }

    public boolean isUsed() {
        return usedAt != null;
    }
}
