package com.homeputers.ebal2.api.service;

import com.homeputers.ebal2.api.serviceplanitem.ServicePlanItemMapper;
import com.homeputers.ebal2.api.serviceplanitem.ServicePlanItemRequest;
import com.homeputers.ebal2.api.serviceplanitem.ServicePlanItemResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/services")
@Tag(name = "Services")
public class ServiceController {
    private final ServiceService service;

    public ServiceController(ServiceService service) {
        this.service = service;
    }

    @GetMapping
    public Page<ServiceResponse> list(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        return service.list(PageRequest.of(page, size)).map(ServiceMapper::toResponse);
    }

    @GetMapping("/{id}")
    public ServiceResponse get(@PathVariable UUID id) {
        return ServiceMapper.toResponse(service.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse create(@Valid @RequestBody ServiceRequest request) {
        return ServiceMapper.toResponse(service.create(request));
    }

    @PutMapping("/{id}")
    public ServiceResponse update(@PathVariable UUID id, @Valid @RequestBody ServiceRequest request) {
        return ServiceMapper.toResponse(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/{id}/plan-items")
    public List<ServicePlanItemResponse> listPlanItems(@PathVariable UUID id) {
        return service.listPlanItems(id).stream().map(ServicePlanItemMapper::toResponse).toList();
    }

    @PostMapping("/{id}/plan-items")
    @ResponseStatus(HttpStatus.CREATED)
    public ServicePlanItemResponse addPlanItem(@PathVariable UUID id, @RequestBody ServicePlanItemRequest request) {
        return ServicePlanItemMapper.toResponse(service.addPlanItem(id, request));
    }
}
