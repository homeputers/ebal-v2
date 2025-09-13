package com.homeputers.ebal2.api.group;

import com.homeputers.ebal2.api.domain.group.Group;
import com.homeputers.ebal2.api.generated.GroupsApi;
import com.homeputers.ebal2.api.generated.model.GroupRequest;
import com.homeputers.ebal2.api.generated.model.GroupResponse;
import com.homeputers.ebal2.api.generated.model.PageGroupResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class GroupController implements GroupsApi {
    private final GroupService service;

    public GroupController(GroupService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<PageGroupResponse> listGroups(Integer page, Integer size) {
        Page<Group> groups = service.list(PageRequest.of(page, size));
        return ResponseEntity.ok(GroupMapper.toPageResponse(groups));
    }

    @Override
    public ResponseEntity<GroupResponse> getGroup(UUID id) {
        return ResponseEntity.ok(GroupMapper.toResponse(service.get(id)));
    }

    @Override
    public ResponseEntity<GroupResponse> createGroup(GroupRequest groupRequest) {
        Group created = service.create(groupRequest);
        return new ResponseEntity<>(GroupMapper.toResponse(created), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<GroupResponse> updateGroup(UUID id, GroupRequest groupRequest) {
        Group updated = service.update(id, groupRequest);
        return ResponseEntity.ok(GroupMapper.toResponse(updated));
    }

    @Override
    public ResponseEntity<Void> deleteGroup(UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> addGroupMember(UUID id, UUID memberId) {
        service.addMember(id, memberId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> removeGroupMember(UUID id, UUID memberId) {
        service.removeMember(id, memberId);
        return ResponseEntity.noContent().build();
    }
}
