package com.homeputers.ebal2.api.domain.groupmember;

import com.homeputers.ebal2.api.domain.group.Group;
import com.homeputers.ebal2.api.domain.member.Member;

public record GroupMember(
        GroupMemberId id,

        Group group,

        Member member
) {
    public GroupMember {
        if (id == null) {
            id = new GroupMemberId(
                    group != null ? group.id() : null,
                    member != null ? member.id() : null
            );
        }
    }
}

