package com.homeputers.ebal2.api.service;

import com.homeputers.ebal2.api.domain.service.ServiceMapper;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItem;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItemMapper;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemRequest;
import com.homeputers.ebal2.api.generated.model.ServiceRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ServiceService {
    private final ServiceMapper serviceMapper;
    private final ServicePlanItemMapper planItemMapper;

    public ServiceService(ServiceMapper serviceMapper, ServicePlanItemMapper planItemMapper) {
        this.serviceMapper = serviceMapper;
        this.planItemMapper = planItemMapper;
    }

    public Page<com.homeputers.ebal2.api.domain.service.Service> list(Pageable pageable) {
        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();
        var results = serviceMapper.findPage(offset, limit);
        int total = serviceMapper.count();
        return new PageImpl<>(results, pageable, total);
    }

    public com.homeputers.ebal2.api.domain.service.Service get(UUID id) {
        var service = serviceMapper.findById(id);
        if (service == null) {
            throw new NoSuchElementException("Service not found");
        }
        return service;
    }

    @Transactional
    public com.homeputers.ebal2.api.domain.service.Service create(ServiceRequest request) {
        var service = ServiceDtoMapper.toEntity(request);
        serviceMapper.insert(service);
        return service;
    }

    @Transactional
    public com.homeputers.ebal2.api.domain.service.Service update(UUID id, ServiceRequest request) {
        com.homeputers.ebal2.api.domain.service.Service existing = get(id);
        com.homeputers.ebal2.api.domain.service.Service updated = new com.homeputers.ebal2.api.domain.service.Service(
                existing.id(),
                request.getStartsAt(),
                request.getLocation()
        );
        serviceMapper.update(updated);
        return updated;
    }

    @Transactional
    public void delete(UUID id) {
        serviceMapper.delete(id);
    }

    public List<ServicePlanItem> listPlanItems(UUID serviceId) {
        return planItemMapper.findByServiceId(serviceId);
    }

    @Transactional
    public ServicePlanItem addPlanItem(UUID serviceId, ServicePlanItemRequest request) {
        com.homeputers.ebal2.api.domain.service.Service service = get(serviceId);
        ServicePlanItem item = com.homeputers.ebal2.api.serviceplanitem.ServicePlanItemDtoMapper.toEntity(service, request);
        planItemMapper.insert(item);
        return item;
    }
}
