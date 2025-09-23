package com.homeputers.ebal2.api.admin.user;

import com.homeputers.ebal2.api.domain.user.User;

import java.util.List;

public record AdminUser(User user, List<String> roles) {
    public AdminUser {
        roles = List.copyOf(roles);
    }
}
