package com.homeputers.ebal2.api.arrangement;

import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.song.Song;

public class ArrangementMapper {
    public static Arrangement toEntity(Song song, ArrangementRequest request) {
        return new Arrangement(null, song, request.key(), request.bpm(), request.meter(), request.lyricsChordpro());
    }

    public static ArrangementResponse toResponse(Arrangement arrangement) {
        return new ArrangementResponse(arrangement.id(), arrangement.song() != null ? arrangement.song().id() : null,
                arrangement.key(), arrangement.bpm(), arrangement.meter(), arrangement.lyricsChordpro());
    }
}
