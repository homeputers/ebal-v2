package com.homeputers.ebal2.api.member;

import java.util.List;
import java.util.UUID;

public record MemberResponse(
        UUID id,
        String displayName,
        List<String> instruments
) {}
