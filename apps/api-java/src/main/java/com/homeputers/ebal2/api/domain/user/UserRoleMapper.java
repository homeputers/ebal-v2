package com.homeputers.ebal2.api.domain.user;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Mapper
public interface UserRoleMapper {
    List<String> findRolesByUserId(@Param("userId") UUID userId);

    void insert(@Param("userId") UUID userId,
                @Param("role") String role,
                @Param("createdAt") OffsetDateTime createdAt);

    void delete(@Param("userId") UUID userId,
                @Param("role") String role);

    void deleteByUserId(@Param("userId") UUID userId);

    List<UserRole> findByUserIds(@Param("userIds") List<UUID> userIds);

    int countByRole(@Param("role") String role);

    int countByRoleExcludingUser(@Param("role") String role,
                                 @Param("userId") UUID userId);
}
