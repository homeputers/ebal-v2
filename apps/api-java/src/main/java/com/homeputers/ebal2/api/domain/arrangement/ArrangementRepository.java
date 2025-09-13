package com.homeputers.ebal2.api.domain.arrangement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ArrangementRepository extends JpaRepository<Arrangement, UUID> {
}
