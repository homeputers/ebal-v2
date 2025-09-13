package com.homeputers.ebal2.api.service;

import com.homeputers.ebal2.api.domain.service.ServiceRepository;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItem;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItemRepository;
import com.homeputers.ebal2.api.serviceplanitem.ServicePlanItemMapper;
import com.homeputers.ebal2.api.serviceplanitem.ServicePlanItemRequest;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ServiceService {
    private final ServiceRepository repository;
    private final ServicePlanItemRepository planItemRepository;

    public ServiceService(ServiceRepository repository, ServicePlanItemRepository planItemRepository) {
        this.repository = repository;
        this.planItemRepository = planItemRepository;
    }

    public Page<com.homeputers.ebal2.api.domain.service.Service> list(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public com.homeputers.ebal2.api.domain.service.Service get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Service not found"));
    }

    @Transactional
    public com.homeputers.ebal2.api.domain.service.Service create(ServiceRequest request) {
        return repository.save(ServiceMapper.toEntity(request));
    }

    @Transactional
    public com.homeputers.ebal2.api.domain.service.Service update(UUID id, ServiceRequest request) {
        com.homeputers.ebal2.api.domain.service.Service existing = get(id);
        com.homeputers.ebal2.api.domain.service.Service updated = new com.homeputers.ebal2.api.domain.service.Service(existing.id(), request.startsAt(), request.location());
        return repository.save(updated);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    public List<ServicePlanItem> listPlanItems(UUID serviceId) {
        return planItemRepository.findByServiceIdOrderBySortOrder(serviceId);
    }

    @Transactional
    public ServicePlanItem addPlanItem(UUID serviceId, ServicePlanItemRequest request) {
        com.homeputers.ebal2.api.domain.service.Service service = get(serviceId);
        ServicePlanItem item = ServicePlanItemMapper.toEntity(service, request);
        return planItemRepository.save(item);
    }
}
