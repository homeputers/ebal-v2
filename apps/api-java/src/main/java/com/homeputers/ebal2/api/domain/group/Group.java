package com.homeputers.ebal2.api.domain.group;

import com.homeputers.ebal2.api.domain.groupmember.GroupMember;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "groups")
public record Group(
        @Id
        UUID id,

        @Column(unique = true)
        String name,

        @OneToMany(mappedBy = "group")
        Set<GroupMember> members
) {
    public Group() {
        this(null, null, null);
    }

    public Group {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (members == null) {
            members = new HashSet<>();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Group group = (Group) o;
        return Objects.equals(id, group.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

