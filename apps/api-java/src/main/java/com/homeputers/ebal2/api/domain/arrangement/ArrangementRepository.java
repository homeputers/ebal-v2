package com.homeputers.ebal2.api.domain.arrangement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ArrangementRepository extends JpaRepository<Arrangement, UUID> {
    List<Arrangement> findBySongId(UUID songId);
}
