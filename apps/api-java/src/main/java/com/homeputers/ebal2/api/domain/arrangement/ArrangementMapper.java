package com.homeputers.ebal2.api.domain.arrangement;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ArrangementMapper {
    Arrangement findById(@Param("id") UUID id);

    List<Arrangement> findBySongId(@Param("songId") UUID songId);

    void insert(Arrangement arrangement);

    void update(Arrangement arrangement);

    void delete(@Param("id") UUID id);
}
