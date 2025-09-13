package com.homeputers.ebal2.api.songsetitem;

import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.songset.SongSet;
import com.homeputers.ebal2.api.domain.songsetitem.SongSetItem;

public class SongSetItemMapper {
    public static SongSetItem toEntity(SongSet songSet, Arrangement arrangement, SongSetItemRequest request) {
        return new SongSetItem(null, songSet, arrangement, request.sortOrder(), request.transpose(), request.capo());
    }

    public static SongSetItemResponse toResponse(SongSetItem item) {
        return new SongSetItemResponse(item.id(), item.songSet().id(), item.arrangement().id(), item.sortOrder(), item.transpose(), item.capo());
    }
}
