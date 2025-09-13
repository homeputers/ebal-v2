package com.homeputers.ebal2.api.songsetitem;

import com.homeputers.ebal2.api.generated.SongSetItemsApi;
import com.homeputers.ebal2.api.generated.model.SongSetItemRequest;
import com.homeputers.ebal2.api.generated.model.SongSetItemResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class SongSetItemController implements SongSetItemsApi {
    private final SongSetItemService service;

    public SongSetItemController(SongSetItemService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<SongSetItemResponse> updateSongSetItem(UUID id, SongSetItemRequest songSetItemRequest) {
        return ResponseEntity.ok(SongSetItemMapper.toResponse(service.update(id, songSetItemRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteSongSetItem(UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
