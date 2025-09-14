package com.homeputers.ebal2.api.song;

import com.homeputers.ebal2.api.arrangement.ArrangementDtoMapper;
import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.song.Song;
import com.homeputers.ebal2.api.generated.SongsApi;
import com.homeputers.ebal2.api.generated.model.ArrangementRequest;
import com.homeputers.ebal2.api.generated.model.ArrangementResponse;
import com.homeputers.ebal2.api.generated.model.PageSongResponse;
import com.homeputers.ebal2.api.generated.model.SongRequest;
import com.homeputers.ebal2.api.generated.model.SongResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class SongController implements SongsApi {
    private final SongService service;

    public SongController(SongService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<PageSongResponse> listSongs(String title, String tag, Integer page, Integer size) {
        Page<Song> songs = service.search(title, tag, PageRequest.of(page, size));
        return ResponseEntity.ok(SongDtoMapper.toPageResponse(songs));
    }

    @Override
    public ResponseEntity<SongResponse> getSong(UUID id) {
        return ResponseEntity.ok(SongDtoMapper.toResponse(service.get(id)));
    }

    @Override
    public ResponseEntity<SongResponse> createSong(@Valid @RequestBody SongRequest songRequest) {
        Song created = service.create(songRequest);
        return new ResponseEntity<>(SongDtoMapper.toResponse(created), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<SongResponse> updateSong(UUID id, @Valid @RequestBody SongRequest songRequest) {
        Song updated = service.update(id, songRequest);
        return ResponseEntity.ok(SongDtoMapper.toResponse(updated));
    }

    @Override
    public ResponseEntity<Void> deleteSong(UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<ArrangementResponse>> listArrangements(UUID id) {
        List<Arrangement> arrangements = service.listArrangements(id);
        return ResponseEntity.ok(arrangements.stream().map(ArrangementDtoMapper::toResponse).toList());
    }

    @Override
    public ResponseEntity<ArrangementResponse> addArrangement(UUID id, ArrangementRequest arrangementRequest) {
        Arrangement created = service.addArrangement(id, arrangementRequest);
        return new ResponseEntity<>(ArrangementDtoMapper.toResponse(created), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<ArrangementResponse> updateArrangement(UUID arrangementId, ArrangementRequest arrangementRequest) {
        Arrangement updated = service.updateArrangement(arrangementId, arrangementRequest);
        return ResponseEntity.ok(ArrangementDtoMapper.toResponse(updated));
    }

    @Override
    public ResponseEntity<Void> deleteArrangement(UUID arrangementId) {
        service.deleteArrangement(arrangementId);
        return ResponseEntity.noContent().build();
    }
}
