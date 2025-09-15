package com.homeputers.ebal2.api.domain.songset;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface SongSetMapper {
    SongSet findById(@Param("id") UUID id);

    List<SongSet> findPage(@Param("offset") int offset,
                           @Param("limit") int limit);

    int count();

    void insert(SongSet songSet);

    void update(SongSet songSet);

    void delete(@Param("id") UUID id);
}
