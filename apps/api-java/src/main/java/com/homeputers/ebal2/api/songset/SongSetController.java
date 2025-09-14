package com.homeputers.ebal2.api.songset;

import com.homeputers.ebal2.api.domain.songset.SongSet;
import com.homeputers.ebal2.api.domain.songsetitem.SongSetItem;
import com.homeputers.ebal2.api.generated.SongSetsApi;
import com.homeputers.ebal2.api.generated.model.PageSongSetResponse;
import com.homeputers.ebal2.api.generated.model.SongSetItemRequest;
import com.homeputers.ebal2.api.generated.model.SongSetItemResponse;
import com.homeputers.ebal2.api.generated.model.SongSetRequest;
import com.homeputers.ebal2.api.generated.model.SongSetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class SongSetController implements SongSetsApi {
    private final SongSetService service;

    public SongSetController(SongSetService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<PageSongSetResponse> listSongSets(Integer page, Integer size) {
        Page<SongSet> sets = service.list(PageRequest.of(page, size));
        return ResponseEntity.ok(SongSetDtoMapper.toPageResponse(sets));
    }

    @Override
    public ResponseEntity<SongSetResponse> getSongSet(UUID id) {
        return ResponseEntity.ok(SongSetDtoMapper.toResponse(service.get(id)));
    }

    @Override
    public ResponseEntity<SongSetResponse> createSongSet(SongSetRequest songSetRequest) {
        SongSet created = service.create(songSetRequest);
        return new ResponseEntity<>(SongSetDtoMapper.toResponse(created), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<SongSetResponse> updateSongSet(UUID id, SongSetRequest songSetRequest) {
        SongSet updated = service.update(id, songSetRequest);
        return ResponseEntity.ok(SongSetDtoMapper.toResponse(updated));
    }

    @Override
    public ResponseEntity<Void> deleteSongSet(UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<SongSetItemResponse>> listSongSetItems(UUID id) {
        List<SongSetItem> items = service.listItems(id);
        return ResponseEntity.ok(items.stream().map(com.homeputers.ebal2.api.songsetitem.SongSetItemDtoMapper::toResponse).toList());
    }

    @Override
    public ResponseEntity<SongSetItemResponse> addSongSetItem(UUID id, SongSetItemRequest songSetItemRequest) {
        SongSetItem created = service.addItem(id, songSetItemRequest);
        return new ResponseEntity<>(com.homeputers.ebal2.api.songsetitem.SongSetItemDtoMapper.toResponse(created), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<Void> removeSongSetItem(UUID id, UUID itemId) {
        service.removeItem(id, itemId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> reorderSongSetItems(UUID id, List<UUID> order) {
        service.reorderItems(id, order);
        return ResponseEntity.noContent().build();
    }
}
