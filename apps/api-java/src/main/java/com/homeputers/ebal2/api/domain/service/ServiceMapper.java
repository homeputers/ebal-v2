package com.homeputers.ebal2.api.domain.service;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Mapper
public interface ServiceMapper {
    Service findById(@Param("id") UUID id);

    List<Service> findPage(@Param("offset") int offset,
                           @Param("limit") int limit);

    List<Service> search(@Param("query") String query,
                         @Param("start") OffsetDateTime start,
                         @Param("end") OffsetDateTime end,
                         @Param("limit") int limit);

    List<Service> findUpcoming(@Param("start") OffsetDateTime start,
                               @Param("limit") int limit);

    int count();

    void insert(Service service);

    void update(Service service);

    void delete(@Param("id") UUID id);
}
