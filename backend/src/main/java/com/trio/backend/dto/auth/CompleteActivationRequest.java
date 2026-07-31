package com.trio.backend.dto.auth;

import com.trio.backend.validation.Password;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteActivationRequest {

    @NotBlank(message = "Activation token is required")
    private String activationToken;

    @NotBlank(message = "Password is required")
    @Password
    private String password;

    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;

}
