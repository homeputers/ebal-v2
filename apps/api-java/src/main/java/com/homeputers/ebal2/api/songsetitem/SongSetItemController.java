package com.homeputers.ebal2.api.songsetitem;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/song-set-items")
@Tag(name = "Song Set Items")
public class SongSetItemController {
    private final SongSetItemService service;

    public SongSetItemController(SongSetItemService service) {
        this.service = service;
    }

    @PutMapping("/{id}")
    public SongSetItemResponse update(@PathVariable UUID id, @Valid @RequestBody SongSetItemRequest request) {
        return SongSetItemMapper.toResponse(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
