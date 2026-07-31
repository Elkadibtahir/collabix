package com.trio.backend.dto.organisation.activity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request de updated (partial) of a Activity.
 */
@Getter
@Setter
public class UpdateActivityRequest {

    // Fields null => ignorÃƒÂ©s (partial update cÃƒÂ´tÃƒÂ© service/mapper)
    @NotBlank
    @Size(max = 2000)
    private String description;

}

