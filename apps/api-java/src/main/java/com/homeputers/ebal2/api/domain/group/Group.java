package com.homeputers.ebal2.api.domain.group;

import com.homeputers.ebal2.api.domain.groupmember.GroupMember;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public record Group(
        UUID id,

        String name,

        Set<GroupMember> members
) {
    public Group {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (members == null) {
            members = new HashSet<>();
        }
    }
}

