package com.homeputers.ebal2.api.domain.serviceplanitem;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServicePlanItemRepository extends JpaRepository<ServicePlanItem, UUID> {
    List<ServicePlanItem> findByServiceIdOrderBySortOrder(UUID serviceId);
}
