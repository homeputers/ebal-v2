package com.homeputers.ebal2.api.domain.serviceplanitem;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ServicePlanItemMapper {
    ServicePlanItem findById(@Param("id") UUID id);

    List<ServicePlanItem> findByServiceId(@Param("serviceId") UUID serviceId);

    void insert(ServicePlanItem item);

    void update(ServicePlanItem item);

    void updateOrder(@Param("id") UUID id,
                     @Param("sortOrder") int sortOrder);

    void delete(@Param("id") UUID id);
}
