package com.homeputers.ebal2.api.group;

import com.homeputers.ebal2.api.domain.group.Group;
import com.homeputers.ebal2.api.generated.model.GroupRequest;
import com.homeputers.ebal2.api.generated.model.GroupResponse;
import com.homeputers.ebal2.api.generated.model.PageGroupResponse;
import org.springframework.data.domain.Page;

public class GroupMapper {
    public static Group toEntity(GroupRequest request) {
        return new Group(null, request.getName(), null);
    }

    public static GroupResponse toResponse(Group group) {
        GroupResponse response = new GroupResponse();
        response.setId(group.id());
        response.setName(group.name());
        response.setMemberIds(group.members().stream().map(m -> m.member().id()).toList());
        return response;
    }

    public static PageGroupResponse toPageResponse(Page<Group> page) {
        PageGroupResponse response = new PageGroupResponse();
        response.setContent(page.getContent().stream().map(GroupMapper::toResponse).toList());
        response.setTotalElements((int) page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setNumber(page.getNumber());
        response.setSize(page.getSize());
        return response;
    }
}
