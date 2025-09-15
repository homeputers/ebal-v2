package com.homeputers.ebal2.api.domain.group;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface GroupMapper {
    Group findById(@Param("id") UUID id);

    List<Group> findPage(@Param("offset") int offset,
                         @Param("limit") int limit);

    int count();

    void insert(@Param("id") UUID id, @Param("name") String name);

    void update(@Param("id") UUID id, @Param("name") String name);

    void delete(@Param("id") UUID id);
}
