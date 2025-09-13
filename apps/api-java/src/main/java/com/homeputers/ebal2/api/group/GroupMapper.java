package com.homeputers.ebal2.api.group;

import com.homeputers.ebal2.api.domain.group.Group;
import java.util.stream.Collectors;

public class GroupMapper {
    public static Group toEntity(GroupRequest request) {
        return new Group(null, request.name(), null);
    }

    public static GroupResponse toResponse(Group group) {
        return new GroupResponse(
                group.id(),
                group.name(),
                group.members().stream().map(m -> m.member().id()).collect(Collectors.toList())
        );
    }
}
