package com.trio.backend.dto.organisation.activity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Create request of a Activity.
 *
 * CRUD only.
 */
@Getter
@Setter
public class CreateActivityRequest {

    @NotBlank
    @Size(max = 2000)
    private String description;

}

