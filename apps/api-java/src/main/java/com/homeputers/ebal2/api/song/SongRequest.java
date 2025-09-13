package com.homeputers.ebal2.api.song;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record SongRequest(
        @NotBlank String title,
        String ccli,
        String author,
        String defaultKey,
        List<String> tags
) {}
