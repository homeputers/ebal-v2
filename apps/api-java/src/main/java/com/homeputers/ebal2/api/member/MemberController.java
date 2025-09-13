package com.homeputers.ebal2.api.member;

import com.homeputers.ebal2.api.domain.member.Member;
import com.homeputers.ebal2.api.generated.MembersApi;
import com.homeputers.ebal2.api.generated.model.MemberRequest;
import com.homeputers.ebal2.api.generated.model.MemberResponse;
import com.homeputers.ebal2.api.generated.model.PageMemberResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class MemberController implements MembersApi {
    private final MemberService service;

    public MemberController(MemberService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<PageMemberResponse> listMembers(String q, Integer page, Integer size) {
        Page<Member> members = service.search(q, PageRequest.of(page, size));
        return ResponseEntity.ok(MemberMapper.toPageResponse(members));
    }

    @Override
    public ResponseEntity<MemberResponse> getMember(UUID id) {
        return ResponseEntity.ok(MemberMapper.toResponse(service.get(id)));
    }

    @Override
    public ResponseEntity<MemberResponse> createMember(MemberRequest memberRequest) {
        Member created = service.create(memberRequest);
        return new ResponseEntity<>(MemberMapper.toResponse(created), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<MemberResponse> updateMember(UUID id, MemberRequest memberRequest) {
        Member updated = service.update(id, memberRequest);
        return ResponseEntity.ok(MemberMapper.toResponse(updated));
    }

    @Override
    public ResponseEntity<Void> deleteMember(UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
