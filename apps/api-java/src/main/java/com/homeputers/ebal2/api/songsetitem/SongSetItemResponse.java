package com.homeputers.ebal2.api.songsetitem;

import java.util.UUID;

public record SongSetItemResponse(
        UUID id,
        UUID songSetId,
        UUID arrangementId,
        Integer sortOrder,
        Integer transpose,
        Integer capo
) {}
