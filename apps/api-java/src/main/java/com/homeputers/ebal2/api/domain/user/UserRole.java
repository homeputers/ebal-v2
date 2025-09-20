package com.homeputers.ebal2.api.domain.user;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserRole(
        UUID userId,
        String role,
        OffsetDateTime createdAt
) {
    public UserRole {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
