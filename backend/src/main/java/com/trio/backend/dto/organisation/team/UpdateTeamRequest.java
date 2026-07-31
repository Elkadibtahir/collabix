package com.trio.backend.dto.organisation.team;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request de updated of a Team.
 *
 * <p>Partial update : the fields null sont ignorÃƒÂ©s cÃƒÂ´tÃƒÂ© service.</p>
 */
@Getter
@Setter
public class UpdateTeamRequest {

    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String description;
}

