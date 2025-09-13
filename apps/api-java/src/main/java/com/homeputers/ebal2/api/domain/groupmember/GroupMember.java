package com.homeputers.ebal2.api.domain.groupmember;

import com.homeputers.ebal2.api.domain.group.Group;
import com.homeputers.ebal2.api.domain.member.Member;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import java.util.Objects;

@Entity
@Table(name = "group_members")
public record GroupMember(
        @EmbeddedId
        GroupMemberId id,

        @ManyToOne
        @MapsId("groupId")
        @JoinColumn(name = "group_id")
        Group group,

        @ManyToOne
        @MapsId("memberId")
        @JoinColumn(name = "member_id")
        Member member
) {
    public GroupMember() {
        this(null, null, null);
    }

    public GroupMember {
        if (id == null) {
            id = new GroupMemberId(
                    group != null ? group.id() : null,
                    member != null ? member.id() : null
            );
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GroupMember that = (GroupMember) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

