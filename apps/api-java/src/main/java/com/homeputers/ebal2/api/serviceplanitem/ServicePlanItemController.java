package com.homeputers.ebal2.api.serviceplanitem;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/service-plan-items")
@Tag(name = "Service Plan Items")
public class ServicePlanItemController {
    private final ServicePlanItemService service;

    public ServicePlanItemController(ServicePlanItemService service) {
        this.service = service;
    }

    @PutMapping("/{id}")
    public ServicePlanItemResponse update(@PathVariable UUID id, @Valid @RequestBody ServicePlanItemRequest request) {
        return ServicePlanItemMapper.toResponse(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
