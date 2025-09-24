package com.homeputers.ebal2.api.profile;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record MyProfileView(
        UUID id,
        String email,
        String displayName,
        String avatarUrl,
        List<String> roles,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public MyProfileView {
        roles = List.copyOf(roles);
    }
}
