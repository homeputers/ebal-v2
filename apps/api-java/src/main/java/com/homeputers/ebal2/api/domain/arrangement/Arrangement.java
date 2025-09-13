package com.homeputers.ebal2.api.domain.arrangement;

import com.homeputers.ebal2.api.domain.song.Song;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "arrangements")
public record Arrangement(
        @Id
        UUID id,

        @ManyToOne
        @JoinColumn(name = "song_id")
        Song song,

        String key,
        Integer bpm,
        String meter,

        @Column(name = "lyrics_chordpro")
        String lyricsChordpro
) {
    public Arrangement() {
        this(null, null, null, null, null, null);
    }

    public Arrangement {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Arrangement that = (Arrangement) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

