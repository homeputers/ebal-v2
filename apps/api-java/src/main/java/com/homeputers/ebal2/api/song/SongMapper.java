package com.homeputers.ebal2.api.song;

import com.homeputers.ebal2.api.domain.song.Song;
import com.homeputers.ebal2.api.generated.model.PageSongResponse;
import com.homeputers.ebal2.api.generated.model.SongRequest;
import com.homeputers.ebal2.api.generated.model.SongResponse;
import org.springframework.data.domain.Page;

public class SongMapper {
    public static Song toEntity(SongRequest request) {
        return new Song(null, request.getTitle(), request.getCcli(), request.getAuthor(), request.getDefaultKey(), request.getTags(), null);
    }

    public static SongResponse toResponse(Song song) {
        SongResponse response = new SongResponse();
        response.setId(song.id());
        response.setTitle(song.title());
        response.setCcli(song.ccli());
        response.setAuthor(song.author());
        response.setDefaultKey(song.defaultKey());
        response.setTags(song.tags());
        return response;
    }

    public static PageSongResponse toPageResponse(Page<Song> page) {
        PageSongResponse response = new PageSongResponse();
        response.setContent(page.getContent().stream().map(SongMapper::toResponse).toList());
        response.setTotalElements((int) page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setNumber(page.getNumber());
        response.setSize(page.getSize());
        return response;
    }
}
