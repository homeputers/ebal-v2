package com.homeputers.ebal2.api.service;

import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItem;
import com.homeputers.ebal2.api.generated.ServicesApi;
import com.homeputers.ebal2.api.generated.model.PageServiceResponse;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemRequest;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemResponse;
import com.homeputers.ebal2.api.generated.model.ServiceRequest;
import com.homeputers.ebal2.api.generated.model.ServiceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ServiceController implements ServicesApi {
    private final ServiceService service;

    public ServiceController(ServiceService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<PageServiceResponse> listServices(Integer page, Integer size) {
        Page<com.homeputers.ebal2.api.domain.service.Service> services = service.list(PageRequest.of(page, size));
        return ResponseEntity.ok(ServiceMapper.toPageResponse(services));
    }

    @Override
    public ResponseEntity<ServiceResponse> getService(UUID id) {
        return ResponseEntity.ok(ServiceMapper.toResponse(service.get(id)));
    }

    @Override
    public ResponseEntity<ServiceResponse> createService(ServiceRequest serviceRequest) {
        com.homeputers.ebal2.api.domain.service.Service created = service.create(serviceRequest);
        return new ResponseEntity<>(ServiceMapper.toResponse(created), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<ServiceResponse> updateService(UUID id, ServiceRequest serviceRequest) {
        com.homeputers.ebal2.api.domain.service.Service updated = service.update(id, serviceRequest);
        return ResponseEntity.ok(ServiceMapper.toResponse(updated));
    }

    @Override
    public ResponseEntity<Void> deleteService(UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<ServicePlanItemResponse>> listServicePlanItems(UUID id) {
        List<ServicePlanItem> items = service.listPlanItems(id);
        return ResponseEntity.ok(items.stream().map(com.homeputers.ebal2.api.serviceplanitem.ServicePlanItemMapper::toResponse).toList());
    }

    @Override
    public ResponseEntity<ServicePlanItemResponse> addServicePlanItem(UUID id, ServicePlanItemRequest servicePlanItemRequest) {
        ServicePlanItem item = service.addPlanItem(id, servicePlanItemRequest);
        return new ResponseEntity<>(com.homeputers.ebal2.api.serviceplanitem.ServicePlanItemMapper.toResponse(item), HttpStatus.CREATED);
    }
}
