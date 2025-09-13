package com.homeputers.ebal2.api.songset;

import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.arrangement.ArrangementRepository;
import com.homeputers.ebal2.api.domain.songset.SongSet;
import com.homeputers.ebal2.api.domain.songset.SongSetRepository;
import com.homeputers.ebal2.api.domain.songsetitem.SongSetItem;
import com.homeputers.ebal2.api.domain.songsetitem.SongSetItemRepository;
import com.homeputers.ebal2.api.songsetitem.SongSetItemMapper;
import com.homeputers.ebal2.api.songsetitem.SongSetItemRequest;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SongSetService {
    private final SongSetRepository repository;
    private final SongSetItemRepository itemRepository;
    private final ArrangementRepository arrangementRepository;

    public SongSetService(SongSetRepository repository, SongSetItemRepository itemRepository, ArrangementRepository arrangementRepository) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.arrangementRepository = arrangementRepository;
    }

    public Page<SongSet> list(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public SongSet get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Song set not found"));
    }

    @Transactional
    public SongSet create(SongSetRequest request) {
        return repository.save(SongSetMapper.toEntity(request));
    }

    @Transactional
    public SongSet update(UUID id, SongSetRequest request) {
        SongSet existing = get(id);
        SongSet updated = new SongSet(existing.id(), request.name());
        return repository.save(updated);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    public List<SongSetItem> listItems(UUID songSetId) {
        return itemRepository.findBySongSetIdOrderBySortOrder(songSetId);
    }

    @Transactional
    public SongSetItem addItem(UUID songSetId, SongSetItemRequest request) {
        SongSet songSet = get(songSetId);
        Arrangement arrangement = arrangementRepository.findById(request.arrangementId()).orElseThrow(() -> new NoSuchElementException("Arrangement not found"));
        SongSetItem item = SongSetItemMapper.toEntity(songSet, arrangement, request);
        return itemRepository.save(item);
    }

    @Transactional
    public void removeItem(UUID songSetId, UUID itemId) {
        SongSetItem item = itemRepository.findById(itemId).orElseThrow(() -> new NoSuchElementException("Item not found"));
        if (!item.songSet().id().equals(songSetId)) {
            throw new NoSuchElementException("Item not part of song set");
        }
        itemRepository.delete(item);
    }

    @Transactional
    public void reorderItems(UUID songSetId, List<UUID> order) {
        List<SongSetItem> items = listItems(songSetId);
        for (int i = 0; i < order.size(); i++) {
            UUID id = order.get(i);
            final int sortOrder = i;
            items.stream()
                    .filter(it -> it.id().equals(id))
                    .findFirst()
                    .ifPresent(it -> {
                        SongSetItem updated = new SongSetItem(
                                it.id(),
                                it.songSet(),
                                it.arrangement(),
                                sortOrder,
                                it.transpose(),
                                it.capo());
                        itemRepository.save(updated);
                    });
        }
    }
}
