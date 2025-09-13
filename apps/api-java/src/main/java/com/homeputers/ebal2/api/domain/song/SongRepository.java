package com.homeputers.ebal2.api.domain.song;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SongRepository extends JpaRepository<Song, UUID> {

    @Query(value = """
            SELECT * FROM songs s
            WHERE (:title IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :title, '%')))
              AND (:tag IS NULL OR :tag = ANY (s.tags))
            """,
            countQuery = """
            SELECT count(*) FROM songs s
            WHERE (:title IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :title, '%')))
              AND (:tag IS NULL OR :tag = ANY (s.tags))
            """,
            nativeQuery = true)
    Page<Song> search(@Param("title") String title, @Param("tag") String tag, Pageable pageable);
}
