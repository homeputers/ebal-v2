package com.homeputers.ebal2.api.group;

import java.util.List;
import java.util.UUID;

public record GroupResponse(
        UUID id,
        String name,
        List<UUID> memberIds
) {}
