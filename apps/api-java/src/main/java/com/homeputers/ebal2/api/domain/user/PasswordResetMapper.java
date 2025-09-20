package com.homeputers.ebal2.api.domain.user;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.OffsetDateTime;
import java.util.UUID;

@Mapper
public interface PasswordResetMapper {
    PasswordResetToken findByToken(@Param("token") String token);

    void insert(@Param("token") String token,
                @Param("userId") UUID userId,
                @Param("expiresAt") OffsetDateTime expiresAt,
                @Param("createdAt") OffsetDateTime createdAt);

    void markUsed(@Param("token") String token,
                  @Param("usedAt") OffsetDateTime usedAt);

    void deleteExpired(@Param("now") OffsetDateTime now);
}
