package com.homeputers.ebal2.api.songsetitem;

import com.homeputers.ebal2.api.domain.songsetitem.SongSetItem;
import com.homeputers.ebal2.api.domain.songsetitem.SongSetItemMapper;
import com.homeputers.ebal2.api.generated.model.SongSetItemRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SongSetItemService {
    private final SongSetItemMapper mapper;

    public SongSetItemService(SongSetItemMapper mapper) {
        this.mapper = mapper;
    }

    public SongSetItem get(UUID id) {
        SongSetItem item = mapper.findById(id);
        if (item == null) {
            throw new NoSuchElementException("Item not found");
        }
        return item;
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
        mapper.update(updated);
        return updated;
    }

    @Transactional
    public void delete(UUID id) {
        mapper.delete(id);
    }
}
