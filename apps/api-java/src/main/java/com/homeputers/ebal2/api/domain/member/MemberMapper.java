package com.homeputers.ebal2.api.domain.member;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface MemberMapper {
    Member findById(@Param("id") UUID id);

    List<Member> findPage(@Param("query") String query,
                          @Param("offset") int offset,
                          @Param("limit") int limit);

    int count(@Param("query") String query);

    void insert(Member member);

    void update(Member member);

    void delete(@Param("id") UUID id);
}
