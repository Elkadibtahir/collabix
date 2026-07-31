package com.trio.backend.dto.auth;

import com.trio.backend.enums.MemberType;
import com.trio.backend.enums.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email
    @Size(max = 150)
    private String email;

    @NotNull(message = "Member type is required")
    private MemberType memberType;

    @NotNull(message = "Role is required")
    private RoleName role;

    private UUID departmentId;

    private UUID teamId;

}
