package com.trio.backend.dto.organisation.team;

import com.trio.backend.enums.WorkspaceStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Response summarye pour une Team.
 */
@Getter
@Setter
public class TeamSummaryResponse {

    private UUID id;

    private UUID departmentId;

    private String name;

    private WorkspaceStatus status;

    private Long memberCount;
}

