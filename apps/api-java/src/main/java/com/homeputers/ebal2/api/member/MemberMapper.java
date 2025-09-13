package com.homeputers.ebal2.api.member;

import com.homeputers.ebal2.api.domain.member.Member;

public class MemberMapper {
    public static Member toEntity(MemberRequest request) {
        return new Member(null, request.displayName(), request.instruments());
    }

    public static MemberResponse toResponse(Member member) {
        return new MemberResponse(member.id(), member.displayName(), member.instruments());
    }
}
