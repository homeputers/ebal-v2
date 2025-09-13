package com.homeputers.ebal2.api.domain.songset;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SongSetRepository extends JpaRepository<SongSet, UUID> {
}
