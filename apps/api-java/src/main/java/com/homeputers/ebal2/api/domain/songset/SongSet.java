package com.homeputers.ebal2.api.domain.songset;

import jakarta.persistence.*;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "song_sets")
public class SongSet {

    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
