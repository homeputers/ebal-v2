package com.homeputers.ebal2.api.domain.user;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.OffsetDateTime;
import java.util.UUID;

@Mapper
public interface UserMapper {
    User findById(@Param("id") UUID id);

    User findByEmail(@Param("email") String email);

    void insert(@Param("id") UUID id,
                @Param("email") String email,
                @Param("passwordHash") String passwordHash,
                @Param("isActive") boolean isActive,
                @Param("createdAt") OffsetDateTime createdAt,
                @Param("updatedAt") OffsetDateTime updatedAt);

    void updatePassword(@Param("id") UUID id,
                        @Param("passwordHash") String passwordHash,
                        @Param("updatedAt") OffsetDateTime updatedAt);

    void updateActive(@Param("id") UUID id,
                      @Param("isActive") boolean isActive,
                      @Param("updatedAt") OffsetDateTime updatedAt);

    void touch(@Param("id") UUID id,
               @Param("updatedAt") OffsetDateTime updatedAt);
}
