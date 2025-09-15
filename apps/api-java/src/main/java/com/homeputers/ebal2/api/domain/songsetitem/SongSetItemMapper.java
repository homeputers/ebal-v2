package com.homeputers.ebal2.api.domain.songsetitem;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface SongSetItemMapper {
    SongSetItem findById(@Param("id") UUID id);

    List<SongSetItem> findBySongSetId(@Param("songSetId") UUID songSetId);

    void insert(SongSetItem item);

    void update(SongSetItem item);

    void updateOrder(@Param("id") UUID id,
                     @Param("sortOrder") int sortOrder);

    void delete(@Param("id") UUID id);
}
