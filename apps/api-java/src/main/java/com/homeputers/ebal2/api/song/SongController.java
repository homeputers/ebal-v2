package com.homeputers.ebal2.api.song;

import com.homeputers.ebal2.api.arrangement.ArrangementMapper;
import com.homeputers.ebal2.api.arrangement.ArrangementRequest;
import com.homeputers.ebal2.api.arrangement.ArrangementResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/songs")
@Tag(name = "Songs")
public class SongController {
    private final SongService service;

    public SongController(SongService service) {
        this.service = service;
    }

    @GetMapping
    public Page<SongResponse> list(@RequestParam(name = "title", required = false) String title,
                                   @RequestParam(name = "tag", required = false) String tag,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "20") int size) {
        return service.search(title, tag, PageRequest.of(page, size)).map(SongMapper::toResponse);
    }

    @GetMapping("/{id}")
    public SongResponse get(@PathVariable UUID id) {
        return SongMapper.toResponse(service.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SongResponse create(@Valid @RequestBody SongRequest request) {
        return SongMapper.toResponse(service.create(request));
    }

    @PutMapping("/{id}")
    public SongResponse update(@PathVariable UUID id, @Valid @RequestBody SongRequest request) {
        return SongMapper.toResponse(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/{id}/arrangements")
    public List<ArrangementResponse> listArrangements(@PathVariable UUID id) {
        return service.listArrangements(id).stream().map(ArrangementMapper::toResponse).toList();
    }

    @PostMapping("/{id}/arrangements")
    @ResponseStatus(HttpStatus.CREATED)
    public ArrangementResponse addArrangement(@PathVariable UUID id, @RequestBody ArrangementRequest request) {
        return ArrangementMapper.toResponse(service.addArrangement(id, request));
    }

    @PutMapping("/arrangements/{arrangementId}")
    public ArrangementResponse updateArrangement(@PathVariable UUID arrangementId, @RequestBody ArrangementRequest request) {
        return ArrangementMapper.toResponse(service.updateArrangement(arrangementId, request));
    }

    @DeleteMapping("/arrangements/{arrangementId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteArrangement(@PathVariable UUID arrangementId) {
        service.deleteArrangement(arrangementId);
    }
}
