package com.homeputers.ebal2.api.serviceplanitem;

import com.homeputers.ebal2.api.domain.service.Service;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItem;

public class ServicePlanItemMapper {
    public static ServicePlanItem toEntity(Service service, ServicePlanItemRequest request) {
        return new ServicePlanItem(null, service, request.type(), request.refId(), request.sortOrder(), request.notes());
    }

    public static ServicePlanItemResponse toResponse(ServicePlanItem item) {
        return new ServicePlanItemResponse(item.id(), item.service().id(), item.type(), item.refId(), item.sortOrder(), item.notes());
    }
}
