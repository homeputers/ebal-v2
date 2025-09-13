package com.homeputers.ebal2.api.service;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record ServiceRequest(
        @NotNull OffsetDateTime startsAt,
        String location
) {}
