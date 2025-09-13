package com.homeputers.ebal2.api.songsetitem;

import com.homeputers.ebal2.api.domain.songsetitem.SongSetItem;
import com.homeputers.ebal2.api.domain.songsetitem.SongSetItemRepository;
import com.homeputers.ebal2.api.generated.model.SongSetItemRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SongSetItemService {
    private final SongSetItemRepository repository;

    public SongSetItemService(SongSetItemRepository repository) {
        this.repository = repository;
    }

    public SongSetItem get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Item not found"));
    }

    @Transactional
    public SongSetItem update(UUID id, SongSetItemRequest request) {
        SongSetItem existing = get(id);
        SongSetItem updated = new SongSetItem(
                existing.id(),
                existing.songSet(),
                existing.arrangement(),
                request.getSortOrder(),
                request.getTranspose(),
                request.getCapo()
        );
        return repository.save(updated);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
