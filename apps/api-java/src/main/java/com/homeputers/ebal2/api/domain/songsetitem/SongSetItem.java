package com.homeputers.ebal2.api.domain.songsetitem;

import com.homeputers.ebal2.api.domain.arrangement.Arrangement;
import com.homeputers.ebal2.api.domain.songset.SongSet;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "song_set_items")
public record SongSetItem(
        @Id
        UUID id,

        @ManyToOne
        @JoinColumn(name = "song_set_id")
        SongSet songSet,

        @ManyToOne
        @JoinColumn(name = "arrangement_id")
        Arrangement arrangement,

        @Column(name = "\"order\"")
        Integer sortOrder,

        Integer transpose,
        Integer capo
) {
    public SongSetItem() {
        this(null, null, null, null, null, null);
    }

    public SongSetItem {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SongSetItem that = (SongSetItem) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

