package com.homeputers.ebal2.api.domain.song;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "songs")
public record Song(
        @Id
        @GeneratedValue
        UUID id,

        String title,
        String ccli,
        String author,

        @Column(name = "default_key")
        String defaultKey,

        @JdbcTypeCode(SqlTypes.ARRAY)
        @Column(name = "tags", columnDefinition = "text[]")
        List<String> tags
) {
    public Song {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (tags == null) {
            tags = new ArrayList<>();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Song song = (Song) o;
        return Objects.equals(id, song.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

