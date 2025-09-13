package com.homeputers.ebal2.api.songset;

import jakarta.validation.constraints.NotBlank;

public record SongSetRequest(
        @NotBlank String name
) {}
