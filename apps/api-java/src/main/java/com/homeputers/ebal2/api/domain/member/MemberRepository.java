package com.homeputers.ebal2.api.domain.member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID> {
    Page<Member> findByDisplayNameContainingIgnoreCase(String displayName, Pageable pageable);
}
