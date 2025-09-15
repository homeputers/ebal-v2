package com.homeputers.ebal2.api.domain.arrangement;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ArrangementMapper {
    Arrangement findById(@Param("id") UUID id);

    List<Arrangement> findBySongId(@Param("songId") UUID songId);

    void insert(@Param("id") UUID id,
              @Param("songId") UUID songId,
              @Param("key") String key,
              @Param("bpm") Integer bpm,
              @Param("meter") String meter,
              @Param("lyricsChordpro") String lyricsChordpro);

    void update(@Param("id") UUID id,
              @Param("key") String key,
              @Param("bpm") Integer bpm,
              @Param("meter") String meter,
              @Param("lyricsChordpro") String lyricsChordpro);

    void delete(@Param("id") UUID id);
}
