package com.homeputers.ebal2.api.domain.token;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ShareTokenMapper {
    ShareToken findByTokenAndType(@Param("token") String token, @Param("type") String type);

    void insert(ShareToken token);
}
