package com.homeputers.ebal2.api.group;

import jakarta.validation.constraints.NotBlank;

public record GroupRequest(
        @NotBlank String name
) {}
