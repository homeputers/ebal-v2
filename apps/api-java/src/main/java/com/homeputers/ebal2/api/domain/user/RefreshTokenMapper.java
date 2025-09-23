package com.homeputers.ebal2.api.domain.user;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Mapper
public interface RefreshTokenMapper {
    RefreshToken findByToken(@Param("token") String token);

    List<RefreshToken> findByUserId(@Param("userId") UUID userId);

    void insert(@Param("token") String token,
                @Param("userId") UUID userId,
                @Param("expiresAt") OffsetDateTime expiresAt,
                @Param("createdAt") OffsetDateTime createdAt,
                @Param("userAgent") String userAgent,
                @Param("ipAddress") String ipAddress);

    void revoke(@Param("token") String token,
                @Param("revokedAt") OffsetDateTime revokedAt);

    void revokeByUserId(@Param("userId") UUID userId,
                        @Param("revokedAt") OffsetDateTime revokedAt);

    void deleteExpired(@Param("now") OffsetDateTime now);
}
