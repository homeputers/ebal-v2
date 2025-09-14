package com.homeputers.ebal2.api.serviceplanitem;

import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItem;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItemMapper;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class ServicePlanItemService {
    private final ServicePlanItemMapper mapper;

    public ServicePlanItemService(ServicePlanItemMapper mapper) {
        this.mapper = mapper;
    }

    public ServicePlanItem get(UUID id) {
        ServicePlanItem item = mapper.findById(id);
        if (item == null) {
            throw new NoSuchElementException("Plan item not found");
        }
        return item;
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
        mapper.update(updated);
        return updated;
    }

    @Transactional
    public void delete(UUID id) {
        mapper.delete(id);
    }
}
