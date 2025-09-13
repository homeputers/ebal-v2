package com.homeputers.ebal2.api.service;

import com.homeputers.ebal2.api.domain.service.Service;
import com.homeputers.ebal2.api.generated.model.PageServiceResponse;
import com.homeputers.ebal2.api.generated.model.ServiceRequest;
import com.homeputers.ebal2.api.generated.model.ServiceResponse;
import org.springframework.data.domain.Page;

public class ServiceMapper {
    public static Service toEntity(ServiceRequest request) {
        return new Service(null, request.getStartsAt(), request.getLocation());
    }

    public static ServiceResponse toResponse(Service service) {
        ServiceResponse response = new ServiceResponse();
        response.setId(service.id());
        response.setStartsAt(service.startsAt());
        response.setLocation(service.location());
        return response;
    }

    public static PageServiceResponse toPageResponse(Page<Service> page) {
        PageServiceResponse response = new PageServiceResponse();
        response.setContent(page.getContent().stream().map(ServiceMapper::toResponse).toList());
        response.setTotalElements((int) page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setNumber(page.getNumber());
        response.setSize(page.getSize());
        return response;
    }
}
