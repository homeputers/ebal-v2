package com.homeputers.ebal2.api.group;

import com.homeputers.ebal2.api.domain.group.Group;
import com.homeputers.ebal2.api.domain.groupmember.GroupMember;
import com.homeputers.ebal2.api.domain.groupmember.GroupMemberId;
import com.homeputers.ebal2.api.domain.groupmember.GroupMemberMapper;
import com.homeputers.ebal2.api.domain.member.Member;
import com.homeputers.ebal2.api.domain.member.MemberMapper;
import com.homeputers.ebal2.api.generated.model.GroupRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class GroupService {
    private final com.homeputers.ebal2.api.domain.group.GroupMapper mapper;
    private final MemberMapper memberMapper;
    private final GroupMemberMapper groupMemberMapper;

    public GroupService(com.homeputers.ebal2.api.domain.group.GroupMapper mapper, MemberMapper memberMapper, GroupMemberMapper groupMemberMapper) {
        this.mapper = mapper;
        this.memberMapper = memberMapper;
        this.groupMemberMapper = groupMemberMapper;
    }

    public Page<Group> list(Pageable pageable) {
        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();
        var content = mapper.findPage(offset, limit).stream().map(this::attachMembers).toList();
        int total = mapper.count();
        return new PageImpl<>(content, pageable, total);
    }

    public Group get(UUID id) {
        Group group = mapper.findById(id);
        if (group == null) {
            throw new NoSuchElementException("Group not found");
        }
        return attachMembers(group);
    }

    @Transactional
    public Group create(GroupRequest request) {
        Group group = GroupMapper.toEntity(request);
        mapper.insert(group.id(), group.name());
        return group;
    }

    @Transactional
    public Group update(UUID id, GroupRequest request) {
        get(id);
        mapper.update(id, request.getName());
        Group updated = new Group(id, request.getName(), null);
        return attachMembers(updated);
    }

    @Transactional
    public void delete(UUID id) {
        mapper.delete(id);
    }

    @Transactional
    public void addMember(UUID groupId, UUID memberId) {
        get(groupId);
        Member member = memberMapper.findById(memberId);
        if (member == null) {
            throw new NoSuchElementException("Member not found");
        }
        if (!groupMemberMapper.exists(groupId, memberId)) {
            groupMemberMapper.insert(groupId, memberId);
        }
    }

    @Transactional
    public void removeMember(UUID groupId, UUID memberId) {
        groupMemberMapper.delete(groupId, memberId);
    }

    private Group attachMembers(Group group) {
        var ids = groupMemberMapper.findMemberIds(group.id());
        var members = ids.stream()
                .map(id -> new GroupMember(
                        new GroupMemberId(group.id(), id),
                        group,
                        new Member(id, null, null, null, null, null, null)))
                .collect(java.util.stream.Collectors.toSet());
        return new Group(group.id(), group.name(), members);
    }
}
