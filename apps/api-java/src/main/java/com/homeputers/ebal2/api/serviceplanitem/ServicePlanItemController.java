package com.homeputers.ebal2.api.serviceplanitem;

import com.homeputers.ebal2.api.generated.ServicePlanItemsApi;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemRequest;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ServicePlanItemController implements ServicePlanItemsApi {
    private final ServicePlanItemService service;

    public ServicePlanItemController(ServicePlanItemService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<ServicePlanItemResponse> updateServicePlanItem(UUID id, ServicePlanItemRequest servicePlanItemRequest) {
        return ResponseEntity.ok(ServicePlanItemDtoMapper.toResponse(service.update(id, servicePlanItemRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteServicePlanItem(UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
