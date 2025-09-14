package com.homeputers.ebal2.api.songset;

import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.arrangement.ArrangementMapper;
import com.homeputers.ebal2.api.domain.songset.SongSet;
import com.homeputers.ebal2.api.domain.songset.SongSetMapper;
import com.homeputers.ebal2.api.domain.songsetitem.SongSetItem;
import com.homeputers.ebal2.api.domain.songsetitem.SongSetItemMapper;
import com.homeputers.ebal2.api.generated.model.SongSetItemRequest;
import com.homeputers.ebal2.api.generated.model.SongSetRequest;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SongSetService {
    private final SongSetMapper songSetMapper;
    private final SongSetItemMapper itemMapper;
    private final ArrangementMapper arrangementMapper;

    public SongSetService(SongSetMapper songSetMapper, SongSetItemMapper itemMapper, ArrangementMapper arrangementMapper) {
        this.songSetMapper = songSetMapper;
        this.itemMapper = itemMapper;
        this.arrangementMapper = arrangementMapper;
    }

    public Page<SongSet> list(Pageable pageable) {
        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();
        var results = songSetMapper.findPage(offset, limit);
        int total = songSetMapper.count();
        return new PageImpl<>(results, pageable, total);
    }

    public SongSet get(UUID id) {
        SongSet set = songSetMapper.findById(id);
        if (set == null) {
            throw new NoSuchElementException("Song set not found");
        }
        return set;
    }

    @Transactional
    public SongSet create(SongSetRequest request) {
        SongSet songSet = SongSetDtoMapper.toEntity(request);
        songSetMapper.insert(songSet);
        return songSet;
    }

    @Transactional
    public SongSet update(UUID id, SongSetRequest request) {
        SongSet existing = get(id);
        SongSet updated = new SongSet(existing.id(), request.getName());
        songSetMapper.update(updated);
        return updated;
    }

    @Transactional
    public void delete(UUID id) {
        songSetMapper.delete(id);
    }

    public List<SongSetItem> listItems(UUID songSetId) {
        return itemMapper.findBySongSetId(songSetId);
    }

    @Transactional
    public SongSetItem addItem(UUID songSetId, SongSetItemRequest request) {
        SongSet songSet = get(songSetId);
        Arrangement arrangement = arrangementMapper.findById(request.getArrangementId());
        if (arrangement == null) {
            throw new NoSuchElementException("Arrangement not found");
        }
        SongSetItem item = com.homeputers.ebal2.api.songsetitem.SongSetItemDtoMapper.toEntity(songSet, arrangement, request);
        itemMapper.insert(item);
        return item;
    }

    @Transactional
    public void removeItem(UUID songSetId, UUID itemId) {
        SongSetItem item = itemMapper.findById(itemId);
        if (item == null) {
            throw new NoSuchElementException("Item not found");
        }
        if (!item.songSet().id().equals(songSetId)) {
            throw new NoSuchElementException("Item not part of song set");
        }
        itemMapper.delete(itemId);
    }

    @Transactional
    public void reorderItems(UUID songSetId, List<UUID> order) {
        for (int i = 0; i < order.size(); i++) {
            itemMapper.updateOrder(order.get(i), i);
        }
    }
}
