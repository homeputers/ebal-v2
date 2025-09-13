package com.homeputers.ebal2.api.domain.song;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SongRepository extends JpaRepository<Song, UUID> {

    @Query("select s from Song s where (:title is null or lower(s.title) like lower(concat('%',:title,'%'))) and (:tag is null or :tag member of s.tags)")
    Page<Song> search(@Param("title") String title, @Param("tag") String tag, Pageable pageable);
}
