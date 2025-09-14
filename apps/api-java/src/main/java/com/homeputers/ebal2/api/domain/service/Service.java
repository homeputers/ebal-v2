package com.homeputers.ebal2.api.domain.service;

import java.time.OffsetDateTime;
import java.util.UUID;

public record Service(
        UUID id,

        OffsetDateTime startsAt,

        String location
) {
    public Service {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}

