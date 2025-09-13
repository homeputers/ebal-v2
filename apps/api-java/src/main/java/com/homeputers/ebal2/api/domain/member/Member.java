package com.homeputers.ebal2.api.domain.member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "members")
public record Member(
        @Id
        UUID id,

        @Column(name = "display_name")
        String displayName,

        @JdbcTypeCode(SqlTypes.ARRAY)
        @Column(name = "instruments", columnDefinition = "text[]")
        List<String> instruments
) {
    public Member() {
        this(null, null, null);
    }

    public Member {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (instruments == null) {
            instruments = new ArrayList<>();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Member member = (Member) o;
        return Objects.equals(id, member.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

