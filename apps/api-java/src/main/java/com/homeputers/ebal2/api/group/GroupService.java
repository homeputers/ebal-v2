package com.homeputers.ebal2.api.group;

import com.homeputers.ebal2.api.domain.group.Group;
import com.homeputers.ebal2.api.domain.group.GroupRepository;
import com.homeputers.ebal2.api.domain.groupmember.GroupMember;
import com.homeputers.ebal2.api.domain.groupmember.GroupMemberId;
import com.homeputers.ebal2.api.domain.groupmember.GroupMemberRepository;
import com.homeputers.ebal2.api.domain.member.Member;
import com.homeputers.ebal2.api.domain.member.MemberRepository;
import com.homeputers.ebal2.api.generated.model.GroupRequest;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class GroupService {
    private final GroupRepository repository;
    private final MemberRepository memberRepository;
    private final GroupMemberRepository groupMemberRepository;

    public GroupService(GroupRepository repository, MemberRepository memberRepository, GroupMemberRepository groupMemberRepository) {
        this.repository = repository;
        this.memberRepository = memberRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    public Page<Group> list(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Group get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Group not found"));
    }

    @Transactional
    public Group create(GroupRequest request) {
        return repository.save(GroupMapper.toEntity(request));
    }

    @Transactional
    public Group update(UUID id, GroupRequest request) {
        Group existing = get(id);
        Group updated = new Group(existing.id(), request.getName(), existing.members());
        return repository.save(updated);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    @Transactional
    public void addMember(UUID groupId, UUID memberId) {
        Group group = get(groupId);
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new NoSuchElementException("Member not found"));
        GroupMemberId id = new GroupMemberId(groupId, memberId);
        if (!groupMemberRepository.existsById(id)) {
            groupMemberRepository.save(new GroupMember(id, group, member));
        }
    }

    @Transactional
    public void removeMember(UUID groupId, UUID memberId) {
        groupMemberRepository.deleteById(new GroupMemberId(groupId, memberId));
    }
}
