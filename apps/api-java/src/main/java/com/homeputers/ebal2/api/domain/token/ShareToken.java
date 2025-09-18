package com.homeputers.ebal2.api.domain.token;

import java.time.OffsetDateTime;

public record ShareToken(
        String token,
        String type,
        String label,
        OffsetDateTime createdAt
) {
}
