package com.homeputers.ebal2.api.songsetitem;

import java.util.UUID;

public record SongSetItemRequest(
        UUID arrangementId,
        Integer sortOrder,
        Integer transpose,
        Integer capo
) {}
