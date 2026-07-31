package com.trio.backend.dto.organisation.department;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Optional;

/**
 * Request de updated d'un Department.
 *
 * <p>Partial update : the fields null sont ignorÃƒÂ©s cÃƒÂ´tÃƒÂ© service.</p>
 */
@Getter
@Setter
public class UpdateDepartmentRequest {

    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String description;
}

