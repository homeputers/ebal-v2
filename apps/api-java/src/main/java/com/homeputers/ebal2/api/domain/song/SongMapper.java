package com.homeputers.ebal2.api.domain.song;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface SongMapper {
    Song findById(@Param("id") UUID id);

    List<Song> search(@Param("title") String title,
                      @Param("tag") String tag,
                      @Param("offset") int offset,
                      @Param("limit") int limit);

    int countSearch(@Param("title") String title,
                    @Param("tag") String tag);

    void insert(@Param("id") UUID id, 
              @Param("title") String title, 
              @Param("ccli") String ccli, 
              @Param("author") String author, 
              @Param("defaultKey") String defaultKey, 
              @Param("tags") List<String> tags);

    void update(@Param("id") UUID id, 
              @Param("title") String title, 
              @Param("ccli") String ccli, 
              @Param("author") String author, 
              @Param("defaultKey") String defaultKey, 
              @Param("tags") List<String> tags);

    void delete(@Param("id") UUID id);
}
