package com.homeputers.ebal2.api.arrangement;

import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.song.Song;
import com.homeputers.ebal2.api.generated.model.ArrangementRequest;
import com.homeputers.ebal2.api.generated.model.ArrangementResponse;

public class ArrangementDtoMapper {
    public static Arrangement toEntity(Song song, ArrangementRequest request) {
        return new Arrangement(
                null,
                song,
                request.getKey(),
                request.getBpm(),
                request.getMeter(),
                request.getLyricsChordpro()
        );
    }

    public static ArrangementResponse toResponse(Arrangement arrangement) {
        ArrangementResponse response = new ArrangementResponse();
        response.setId(arrangement.id());
        if (arrangement.song() != null) {
            response.setSongId(arrangement.song().id());
        }
        response.setKey(arrangement.key());
        response.setBpm(arrangement.bpm());
        response.setMeter(arrangement.meter());
        response.setLyricsChordpro(arrangement.lyricsChordpro());
        return response;
    }
}
