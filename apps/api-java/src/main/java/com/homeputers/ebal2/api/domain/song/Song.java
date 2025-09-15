package com.homeputers.ebal2.api.domain.song;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record Song(
        UUID id,

        String title,
        String ccli,
        String author,

        String defaultKey,

        List<String> tags
) {
    public Song {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (tags == null) {
            tags = new ArrayList<>();
        }
    }
}

