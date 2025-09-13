package com.homeputers.ebal2.api.song;

import com.homeputers.ebal2.api.domain.song.Song;

public class SongMapper {
    public static Song toEntity(SongRequest request) {
        return new Song(null, request.title(), request.ccli(), request.author(), request.defaultKey(), request.tags());
    }

    public static SongResponse toResponse(Song song) {
        return new SongResponse(song.id(), song.title(), song.ccli(), song.author(), song.defaultKey(), song.tags());
    }
}
