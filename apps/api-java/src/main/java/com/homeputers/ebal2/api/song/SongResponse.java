package com.homeputers.ebal2.api.song;

import java.util.List;
import java.util.UUID;

public record SongResponse(
        UUID id,
        String title,
        String ccli,
        String author,
        String defaultKey,
        List<String> tags
) {}
