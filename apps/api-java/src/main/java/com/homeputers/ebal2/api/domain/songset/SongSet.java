package com.homeputers.ebal2.api.domain.songset;

import java.util.UUID;

public record SongSet(
        UUID id,
        String name
) {
    public SongSet {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}

