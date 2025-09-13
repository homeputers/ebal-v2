package com.homeputers.ebal2.api.arrangement;

public record ArrangementRequest(
        String key,
        Integer bpm,
        String meter,
        String lyricsChordpro
) {}
