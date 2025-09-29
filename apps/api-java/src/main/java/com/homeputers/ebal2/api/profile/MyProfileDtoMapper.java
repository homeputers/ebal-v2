package com.homeputers.ebal2.api.profile;

import com.homeputers.ebal2.api.generated.model.MyProfile;
import com.homeputers.ebal2.api.generated.model.Role;
import org.openapitools.jackson.nullable.JsonNullable;

import java.net.URI;
import java.util.Objects;
import java.util.stream.Collectors;

public final class MyProfileDtoMapper {

    private MyProfileDtoMapper() {
    }

    public static MyProfile toDto(MyProfileView view) {
        Objects.requireNonNull(view, "view");
        MyProfile dto = new MyProfile();
        dto.setId(view.id());
        dto.setEmail(view.email());
        dto.setDisplayName(view.displayName());
        if (view.avatarUrl() != null) {
            dto.setAvatarUrl(JsonNullable.of(URI.create(view.avatarUrl())));
        } else {
            dto.setAvatarUrl(JsonNullable.undefined());
        }
        dto.setIsActive(view.isActive());
        dto.setCreatedAt(view.createdAt());
        dto.setUpdatedAt(view.updatedAt());
        dto.setRoles(view.roles().stream()
                .map(MyProfileDtoMapper::mapRole)
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));
        return dto;
    }

    private static Role mapRole(String value) {
        if (value == null) {
            return null;
        }
        try {
            return Role.fromValue(value);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
