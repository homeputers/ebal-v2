package com.homeputers.ebal2.api.domain.member;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record Member(
        UUID id,

        String displayName,

        List<String> instruments,

        String email,

        String phoneNumber,

        Integer birthdayMonth,

        Integer birthdayDay
) {
    public Member {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (instruments == null) {
            instruments = new ArrayList<>();
        }
    }
}

