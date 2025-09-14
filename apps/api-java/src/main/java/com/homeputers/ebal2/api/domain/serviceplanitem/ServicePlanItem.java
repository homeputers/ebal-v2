package com.homeputers.ebal2.api.domain.serviceplanitem;

import com.homeputers.ebal2.api.domain.service.Service;

import java.util.UUID;

public record ServicePlanItem(
        UUID id,

        Service service,

        String type,

        UUID refId,

        Integer sortOrder,

        String notes
) {
    public ServicePlanItem {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}

