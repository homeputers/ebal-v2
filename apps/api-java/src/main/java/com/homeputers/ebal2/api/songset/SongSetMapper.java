package com.homeputers.ebal2.api.songset;

import com.homeputers.ebal2.api.domain.songset.SongSet;

public class SongSetMapper {
    public static SongSet toEntity(SongSetRequest request) {
        return new SongSet(null, request.name());
    }

    public static SongSetResponse toResponse(SongSet songSet) {
        return new SongSetResponse(songSet.id(), songSet.name());
    }
}
