package com.homeputers.ebal2.api.serviceplanitem;

import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItem;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItemRepository;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class ServicePlanItemService {
    private final ServicePlanItemRepository repository;

    public ServicePlanItemService(ServicePlanItemRepository repository) {
        this.repository = repository;
    }

    public ServicePlanItem get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Plan item not found"));
    }

    @Transactional
    public ServicePlanItem update(UUID id, ServicePlanItemRequest request) {
        ServicePlanItem existing = get(id);
        ServicePlanItem updated = new ServicePlanItem(
                existing.id(),
                existing.service(),
                request.getType(),
                request.getRefId(),
                request.getSortOrder(),
                request.getNotes()
        );
        return repository.save(updated);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
