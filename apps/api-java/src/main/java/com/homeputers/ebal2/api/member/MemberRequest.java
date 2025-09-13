package com.homeputers.ebal2.api.member;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record MemberRequest(
        @NotBlank String displayName,
        List<String> instruments
) {}
