package com.trio.backend.dto.auth;

import com.trio.backend.enums.RoleName;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignRolesRequest {

    @NotEmpty(message = "At least one role is required")
    private Set<RoleName> roles;

}
