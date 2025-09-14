package com.homeputers.ebal2.api.search;

import java.util.UUID;

public record SearchResultDto(
        String kind,
        UUID id,
        String title,
        String subtitle
) {}

