package com.homeputers.ebal2.api.arrangement;

import java.util.UUID;

public record ArrangementResponse(
        UUID id,
        UUID songId,
        String key,
        Integer bpm,
        String meter,
        String lyricsChordpro
) {}
