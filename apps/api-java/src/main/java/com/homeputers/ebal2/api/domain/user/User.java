package com.homeputers.ebal2.api.domain.user;

import java.util.UUID;

public record User(
        UUID id,
        String email,
        String role
) {
    public User {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}

