package com.homeputers.ebal2.api.domain.user;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.OffsetDateTime;
import java.util.UUID;

@Mapper
public interface EmailChangeTokenMapper {

    EmailChangeToken findByToken(@Param("token") String token);

    void insert(@Param("id") UUID id,
                @Param("userId") UUID userId,
                @Param("newEmail") String newEmail,
                @Param("token") String token,
                @Param("expiresAt") OffsetDateTime expiresAt,
                @Param("createdAt") OffsetDateTime createdAt);

    void markUsed(@Param("id") UUID id,
                  @Param("usedAt") OffsetDateTime usedAt);

    void deleteExpired(@Param("now") OffsetDateTime now);

    void deleteByUserId(@Param("userId") UUID userId);
}
