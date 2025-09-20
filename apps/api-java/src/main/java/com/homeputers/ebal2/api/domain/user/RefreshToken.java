package com.homeputers.ebal2.api.domain.user;

import java.time.OffsetDateTime;
import java.util.UUID;

public record RefreshToken(
        String token,
        UUID userId,
        OffsetDateTime expiresAt,
        OffsetDateTime revokedAt,
        OffsetDateTime createdAt,
        String userAgent,
        String ipAddress
) {
    public RefreshToken {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
