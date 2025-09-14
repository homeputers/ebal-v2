package com.homeputers.ebal2.api.serviceplanitem;

import com.homeputers.ebal2.api.domain.service.Service;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItem;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemRequest;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemResponse;

public class ServicePlanItemDtoMapper {
    public static ServicePlanItem toEntity(Service service, ServicePlanItemRequest request) {
        return new ServicePlanItem(null, service, request.getType(), request.getRefId(), request.getSortOrder(), request.getNotes());
    }

    public static ServicePlanItemResponse toResponse(ServicePlanItem item) {
        ServicePlanItemResponse response = new ServicePlanItemResponse();
        response.setId(item.id());
        response.setServiceId(item.service().id());
        response.setType(item.type());
        response.setRefId(item.refId());
        response.setSortOrder(item.sortOrder());
        response.setNotes(item.notes());
        return response;
    }
}
