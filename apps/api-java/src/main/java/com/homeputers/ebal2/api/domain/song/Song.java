package com.homeputers.ebal2.api.domain.song;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.domain.Persistable;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

@Entity
@Table(name = "songs")
public record Song(
        @Id UUID id,

        String title,
        String ccli,
        String author,

        @Column(name = "default_key")
        String defaultKey,

        @JdbcTypeCode(SqlTypes.ARRAY)
        @Column(name = "tags", columnDefinition = "text[]")
        List<String> tags,

        @Transient
        AtomicBoolean persisted
) implements Persistable<UUID> {

    /**
     * Zero-argument constructor required by JPA. Values default to {@code null} and
     * are initialized in the canonical constructor.
     */
    public Song() {
        this(null, null, null, null, null, null, null);
    }

    public Song {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (tags == null) {
            tags = new ArrayList<>();
        }
        if (persisted == null) {
            persisted = new AtomicBoolean(false);
        }
    }

    @Override
    public UUID getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return !persisted.get();
    }

    @PostPersist
    @PostLoad
    private void markPersisted() {
        this.persisted.set(true);
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

