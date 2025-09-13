package com.homeputers.ebal2.api.domain.groupmember;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
public record GroupMemberId(UUID groupId, UUID memberId) implements Serializable {
}

