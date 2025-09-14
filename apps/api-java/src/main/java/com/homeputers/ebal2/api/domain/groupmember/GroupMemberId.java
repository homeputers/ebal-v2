package com.homeputers.ebal2.api.domain.groupmember;

import java.io.Serializable;
import java.util.UUID;

public record GroupMemberId(UUID groupId, UUID memberId) implements Serializable {
}

