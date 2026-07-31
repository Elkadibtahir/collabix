package com.trio.backend.dto.organisation.teamMember;

import com.trio.backend.enums.WorkspaceMemberStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Response for un TeamMember.
 */
@Getter
@Setter
public class TeamMemberResponse {

    private UUID teamId;

    private UUID userId;

    private WorkspaceMemberStatus status;

    private Instant joinedAt;

    private Instant leftAt;
}

