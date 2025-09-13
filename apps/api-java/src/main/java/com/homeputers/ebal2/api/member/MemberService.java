package com.homeputers.ebal2.api.member;

import com.homeputers.ebal2.api.domain.member.Member;
import com.homeputers.ebal2.api.domain.member.MemberRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class MemberService {
    private final MemberRepository repository;

    public MemberService(MemberRepository repository) {
        this.repository = repository;
    }

    public Member get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Member not found"));
    }

    public Page<Member> search(String query, Pageable pageable) {
        if (query != null && !query.isBlank()) {
            return repository.findByDisplayNameContainingIgnoreCase(query, pageable);
        }
        return repository.findAll(pageable);
    }

    @Transactional
    public Member create(MemberRequest request) {
        return repository.save(MemberMapper.toEntity(request));
    }

    @Transactional
    public Member update(UUID id, MemberRequest request) {
        Member existing = get(id);
        Member updated = new Member(existing.id(), request.displayName(), request.instruments());
        return repository.save(updated);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
