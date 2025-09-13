package com.homeputers.ebal2.api.service;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ServiceResponse(
        UUID id,
        OffsetDateTime startsAt,
        String location
) {}
