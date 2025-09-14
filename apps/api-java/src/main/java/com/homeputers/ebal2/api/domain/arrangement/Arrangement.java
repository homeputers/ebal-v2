package com.homeputers.ebal2.api.domain.arrangement;

import com.homeputers.ebal2.api.domain.song.Song;

import java.util.UUID;

public record Arrangement(
        UUID id,

        Song song,

        String key,
        Integer bpm,
        String meter,

        String lyricsChordpro
) {
    public Arrangement {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}

