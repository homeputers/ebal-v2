package com.homeputers.ebal2.api.songset;

import com.homeputers.ebal2.api.domain.songset.SongSet;
import com.homeputers.ebal2.api.generated.model.PageSongSetResponse;
import com.homeputers.ebal2.api.generated.model.SongSetRequest;
import com.homeputers.ebal2.api.generated.model.SongSetResponse;
import org.springframework.data.domain.Page;

public class SongSetDtoMapper {
    public static SongSet toEntity(SongSetRequest request) {
        return new SongSet(null, request.getName());
    }

    public static SongSetResponse toResponse(SongSet songSet) {
        SongSetResponse response = new SongSetResponse();
        response.setId(songSet.id());
        response.setName(songSet.name());
        return response;
    }

    public static PageSongSetResponse toPageResponse(Page<SongSet> page) {
        PageSongSetResponse response = new PageSongSetResponse();
        response.setContent(page.getContent().stream().map(SongSetDtoMapper::toResponse).toList());
        response.setTotalElements((int) page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setNumber(page.getNumber());
        response.setSize(page.getSize());
        return response;
    }
}
