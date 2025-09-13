package com.homeputers.ebal2.api.domain.songsetitem;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SongSetItemRepository extends JpaRepository<SongSetItem, UUID> {
}
