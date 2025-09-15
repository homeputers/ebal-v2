package com.homeputers.ebal2.api.member;

import com.homeputers.ebal2.api.domain.member.Member;
import org.springframework.data.domain.PageImpl;
import com.homeputers.ebal2.api.generated.model.MemberRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class MemberService {
    private final com.homeputers.ebal2.api.domain.member.MemberMapper mapper;

    public MemberService(com.homeputers.ebal2.api.domain.member.MemberMapper mapper) {
        this.mapper = mapper;
    }

    public Member get(UUID id) {
        Member member = mapper.findById(id);
        if (member == null) {
            throw new NoSuchElementException("Member not found");
        }
        return member;
    }

    public Page<Member> search(String query, Pageable pageable) {
        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();
        var content = mapper.findPage(query, offset, limit);
        int total = mapper.count(query);
        return new PageImpl<>(content, pageable, total);
    }

    @Transactional
    public Member create(MemberRequest request) {
        Member member = MemberMapper.toEntity(request);
        mapper.insert(member.id(), member.displayName(), member.instruments());
        return member;
    }

    @Transactional
    public Member update(UUID id, MemberRequest request) {
        get(id);
        Member updated = new Member(id, request.getDisplayName(), request.getInstruments());
        mapper.update(id, request.getDisplayName(), request.getInstruments());
        return updated;
    }

    @Transactional
    public void delete(UUID id) {
        mapper.delete(id);
    }
}
