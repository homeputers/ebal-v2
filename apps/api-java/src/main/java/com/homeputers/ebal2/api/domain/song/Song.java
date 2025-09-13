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
public class Song {

    @Id
    @GeneratedValue
    private UUID id;

    private String title;
    private String ccli;
    private String author;

    @Column(name = "default_key")
    private String defaultKey;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags", columnDefinition = "text[]")
    private List<String> tags = new ArrayList<>();

    protected Song() {
    }

    public Song(UUID id, String title, String ccli, String author, String defaultKey, List<String> tags) {
        this.id = id == null ? UUID.randomUUID() : id;
        this.title = title;
        this.ccli = ccli;
        this.author = author;
        this.defaultKey = defaultKey;
        if (tags != null) {
            this.tags = tags;
        }
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getCcli() {
        return ccli;
    }

    public String getAuthor() {
        return author;
    }

    public String getDefaultKey() {
        return defaultKey;
    }

    public List<String> getTags() {
        return tags;
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

