package com.trio.backend.dto.organisation.team;

import com.trio.backend.enums.WorkspaceStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Variante Ã¢â‚¬Å“detailsÃ¢â‚¬Â pour une Team.
 */
@Getter
@Setter
public class TeamDetailsResponse {

    private UUID id;

    private UUID departmentId;

    private String name;

    private String description;

    private WorkspaceStatus status;

    private Long memberCount;
}

