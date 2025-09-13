package com.homeputers.ebal2.api.songset;

import com.homeputers.ebal2.api.songsetitem.SongSetItemMapper;
import com.homeputers.ebal2.api.songsetitem.SongSetItemRequest;
import com.homeputers.ebal2.api.songsetitem.SongSetItemResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/song-sets")
@Tag(name = "Song Sets")
public class SongSetController {
    private final SongSetService service;

    public SongSetController(SongSetService service) {
        this.service = service;
    }

    @GetMapping
    public Page<SongSetResponse> list(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        return service.list(PageRequest.of(page, size)).map(SongSetMapper::toResponse);
    }

    @GetMapping("/{id}")
    public SongSetResponse get(@PathVariable UUID id) {
        return SongSetMapper.toResponse(service.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SongSetResponse create(@Valid @RequestBody SongSetRequest request) {
        return SongSetMapper.toResponse(service.create(request));
    }

    @PutMapping("/{id}")
    public SongSetResponse update(@PathVariable UUID id, @Valid @RequestBody SongSetRequest request) {
        return SongSetMapper.toResponse(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/{id}/items")
    public List<SongSetItemResponse> listItems(@PathVariable UUID id) {
        return service.listItems(id).stream().map(SongSetItemMapper::toResponse).toList();
    }

    @PostMapping("/{id}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public SongSetItemResponse addItem(@PathVariable UUID id, @RequestBody SongSetItemRequest request) {
        return SongSetItemMapper.toResponse(service.addItem(id, request));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeItem(@PathVariable UUID id, @PathVariable UUID itemId) {
        service.removeItem(id, itemId);
    }

    @PostMapping("/{id}/items/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderItems(@PathVariable UUID id, @RequestBody List<UUID> order) {
        service.reorderItems(id, order);
    }
}
