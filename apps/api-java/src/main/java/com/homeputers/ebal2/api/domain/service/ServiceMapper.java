package com.homeputers.ebal2.api.domain.service;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ServiceMapper {
    Service findById(@Param("id") UUID id);

    List<Service> findPage(@Param("offset") int offset,
                           @Param("limit") int limit);

    int count();

    void insert(Service service);

    void update(Service service);

    void delete(@Param("id") UUID id);
}
