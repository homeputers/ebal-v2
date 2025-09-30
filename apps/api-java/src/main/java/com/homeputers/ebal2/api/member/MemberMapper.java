package com.homeputers.ebal2.api.member;

import com.homeputers.ebal2.api.domain.member.Member;
import com.homeputers.ebal2.api.generated.model.MemberRequest;
import com.homeputers.ebal2.api.generated.model.MemberResponse;
import com.homeputers.ebal2.api.generated.model.PageMemberResponse;
import org.springframework.data.domain.Page;

public class MemberMapper {
    public static Member toEntity(MemberRequest request) {
        return new Member(
                null,
                request.getDisplayName(),
                request.getInstruments(),
                request.getEmail(),
                request.getPhoneNumber(),
                request.getBirthdayMonth(),
                request.getBirthdayDay());
    }

    public static MemberResponse toResponse(Member member) {
        MemberResponse response = new MemberResponse();
        response.setId(member.id());
        response.setDisplayName(member.displayName());
        response.setInstruments(member.instruments());
        response.setEmail(member.email());
        response.setPhoneNumber(member.phoneNumber());
        response.setBirthdayMonth(member.birthdayMonth());
        response.setBirthdayDay(member.birthdayDay());
        return response;
    }

    public static PageMemberResponse toPageResponse(Page<Member> page) {
        PageMemberResponse response = new PageMemberResponse();
        response.setContent(page.getContent().stream().map(MemberMapper::toResponse).toList());
        response.setTotalElements((int) page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setNumber(page.getNumber());
        response.setSize(page.getSize());
        return response;
    }
}
