package com.homeputers.ebal2.api.domain.songsetitem;

import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.songset.SongSet;

import java.util.UUID;

public record SongSetItem(
        UUID id,

        SongSet songSet,

        Arrangement arrangement,

        Integer sortOrder,

        Integer transpose,
        Integer capo
) {
    public SongSetItem {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}

