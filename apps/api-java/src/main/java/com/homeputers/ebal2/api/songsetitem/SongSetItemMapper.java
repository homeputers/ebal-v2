package com.homeputers.ebal2.api.songsetitem;

import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.songset.SongSet;
import com.homeputers.ebal2.api.domain.songsetitem.SongSetItem;
import com.homeputers.ebal2.api.generated.model.SongSetItemRequest;
import com.homeputers.ebal2.api.generated.model.SongSetItemResponse;

public class SongSetItemMapper {
    public static SongSetItem toEntity(SongSet songSet, Arrangement arrangement, SongSetItemRequest request) {
        return new SongSetItem(null, songSet, arrangement, request.getSortOrder(), request.getTranspose(), request.getCapo());
    }

    public static SongSetItemResponse toResponse(SongSetItem item) {
        SongSetItemResponse response = new SongSetItemResponse();
        response.setId(item.id());
        response.setSongSetId(item.songSet().id());
        response.setArrangementId(item.arrangement().id());
        response.setSortOrder(item.sortOrder());
        response.setTranspose(item.transpose());
        response.setCapo(item.capo());
        return response;
    }
}
