package com.homeputers.ebal2.api.serviceplanitem;

import java.util.UUID;

public record ServicePlanItemResponse(
        UUID id,
        UUID serviceId,
        String type,
        UUID refId,
        Integer sortOrder,
        String notes
) {}
