package com.homeputers.ebal2.api.domain.groupmember;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface GroupMemberMapper {
    List<UUID> findMemberIds(@Param("groupId") UUID groupId);

    boolean exists(@Param("groupId") UUID groupId,
                   @Param("memberId") UUID memberId);

    void insert(@Param("groupId") UUID groupId,
                @Param("memberId") UUID memberId);

    void delete(@Param("groupId") UUID groupId,
                @Param("memberId") UUID memberId);
}
