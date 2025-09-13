package com.homeputers.ebal2.api.domain.songset;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "song_sets")
public record SongSet(
        @Id
        @GeneratedValue
        UUID id,
        String name
) {
    public SongSet {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SongSet songSet = (SongSet) o;
        return Objects.equals(id, songSet.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

