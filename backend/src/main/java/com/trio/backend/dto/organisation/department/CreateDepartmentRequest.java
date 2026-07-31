package com.trio.backend.dto.organisation.department;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Create request d'un Department.
 */
@Getter
@Setter
public class CreateDepartmentRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String description;
}

