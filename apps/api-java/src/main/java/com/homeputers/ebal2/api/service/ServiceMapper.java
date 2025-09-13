package com.homeputers.ebal2.api.service;

import com.homeputers.ebal2.api.domain.service.Service;

public class ServiceMapper {
    public static Service toEntity(ServiceRequest request) {
        return new Service(null, request.startsAt(), request.location());
    }

    public static ServiceResponse toResponse(Service service) {
        return new ServiceResponse(service.id(), service.startsAt(), service.location());
    }
}
