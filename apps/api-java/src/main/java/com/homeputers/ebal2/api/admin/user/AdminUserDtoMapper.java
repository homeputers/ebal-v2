package com.homeputers.ebal2.api.admin.user;

import com.homeputers.ebal2.api.generated.model.PageUserResponse;
import com.homeputers.ebal2.api.generated.model.Role;
import com.homeputers.ebal2.api.generated.model.User;
import org.springframework.data.domain.Page;

import java.net.URI;
import java.util.Objects;
import java.util.stream.Collectors;

public final class AdminUserDtoMapper {

    private AdminUserDtoMapper() {
    }

    public static User toDto(AdminUser adminUser) {
        Objects.requireNonNull(adminUser, "adminUser");
        User dto = new User();
        dto.setId(adminUser.user().id());
        dto.setEmail(adminUser.user().email());
        dto.setDisplayName(adminUser.user().displayName());
        if (adminUser.user().avatarUrl() != null) {
            dto.setAvatarUrl(URI.create(adminUser.user().avatarUrl()));
        } else {
            dto.setAvatarUrl(null);
        }
        dto.setIsActive(adminUser.user().isActive());
        dto.setCreatedAt(adminUser.user().createdAt());
        dto.setUpdatedAt(adminUser.user().updatedAt());
        dto.setRoles(adminUser.roles().stream()
                .map(AdminUserDtoMapper::mapRole)
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));
        return dto;
    }

    public static PageUserResponse toPage(Page<AdminUser> page) {
        PageUserResponse response = new PageUserResponse();
        response.setContent(page.getContent().stream().map(AdminUserDtoMapper::toDto).toList());
        response.setTotalElements(Math.toIntExact(page.getTotalElements()));
        response.setTotalPages(page.getTotalPages());
        response.setNumber(page.getNumber());
        response.setSize(page.getSize());
        return response;
    }

    private static Role mapRole(String role) {
        try {
            return Role.fromValue(role);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
