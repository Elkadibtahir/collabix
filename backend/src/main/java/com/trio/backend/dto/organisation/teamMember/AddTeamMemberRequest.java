package com.trio.backend.dto.organisation.teamMember;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Request pour ajouter un member ÃƒÂ  une Team.
 */
@Getter
@Setter
public class AddTeamMemberRequest {

    @NotNull
    private UUID teamId;

    @NotNull
    private UUID userId;
}

