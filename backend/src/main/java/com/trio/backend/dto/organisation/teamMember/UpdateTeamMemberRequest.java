package com.trio.backend.dto.organisation.teamMember;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Request de updated d'un TeamMember.
 *
 * <p>Pour le MVP, aucune given mutable n'est encore defined.</p>
 */
@Getter
@Setter
public class UpdateTeamMemberRequest {

    /**
     * Field rÃƒÂ©servÃƒÂ© si besoin d'ÃƒÂ©volution future.
     */
    private UUID unused;
}

