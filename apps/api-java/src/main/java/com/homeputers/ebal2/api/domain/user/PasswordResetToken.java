package com.homeputers.ebal2.api.domain.user;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PasswordResetToken(
        String token,
        UUID userId,
        OffsetDateTime expiresAt,
        OffsetDateTime usedAt,
        OffsetDateTime createdAt
) {
    public PasswordResetToken {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
