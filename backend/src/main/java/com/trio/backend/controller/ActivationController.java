package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.auth.CompleteActivationRequest;
import com.trio.backend.entity.User;
import com.trio.backend.enums.UserStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.repository.UserRepository;
import com.trio.backend.service.AccountActivationService;
import com.trio.backend.service.AuthService;
import com.trio.backend.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Activation", description = "Endpoints pour l'activation des comptes users")
public class ActivationController {

    private final AccountActivationService accountActivationService;
    private final AuthService authService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${app.activation.base-url:http://localhost:5173}")
    private String activationBaseUrl;

    /**
     * Active le compte of a user Ã  partir d'un token of activation.
     *
     * <p>Cette route est callÃ©e lorsque the user clique sur le link
     * received par email. The token est validated (existence, expiration, utilisation)
     * puis le compte est activÃ©.</p>
     *
     * @param token the token of activation received par email
     * @return une response de success si l'activation est successfule
     */
    @GetMapping("/activate")
    @Operation(
            summary = "Activer un compte",
            description = "Active le compte user Ã  partir d'un token of activation valid."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Compte activÃ© avec success",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Token expiresd ou already in use"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Token non-existent")
    })
    public ApiResponse<Void> activate(
            @Parameter(description = "Token of activation received par email", required = true)
            @RequestParam String token
    ) {

        accountActivationService.activateAccount(token);

        return ApiResponse.success("Account activated successfully.");
    }

    /**
     * Finalise l'activation d'un compte user.
     *
     * <p>Cette route est callÃ©e from the page "Create votre mot de passe"
     * du frontend. Elle valid the token of activation, saves le mot de
     * passe, active le compte et marque the token comme used.</p>
     *
     * @param request the request containing the token of activation, le mot de passe et sa confirmation
     * @return une response de success si l'activation est successfule
     */
    @PostMapping("/activate")
    @Operation(
            summary = "Finaliser l'activation du compte",
            description = "Valid the token of activation, saves le mot de passe et active le compte."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Compte activÃ© avec success",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Token invalid, expiresd, already in use ou mots de passe non conformes")
    })
    public ApiResponse<Void> completeActivation(
            @Parameter(description = "Request of activation Complete", required = true)
            @RequestBody @Valid CompleteActivationRequest request
    ) {
        authService.completeActivation(request);
        return ApiResponse.success("Account activated successfully. You can now log in.");
    }

    /**
     * Returns un email of activation Ã  un user.
     *
     * <p>Cette route allows Ã  un user de receive a new link
     * of activation si le previous a expiresd ou a Ã©tÃ© perdu.</p>
     *
     * @param email l'email de the user
     * @return une response de success si l'email a Ã©tÃ© returned
     */
    @PostMapping("/resend-activation")
    @Operation(
            summary = "Rsend l'email of activation",
            description = "Rsend a new token of activation par email."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Email of activation returned",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Compte dÃ©jÃ  activÃ©"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ApiResponse<Void> resendActivation(
            @Parameter(description = "Email de the user", required = true)
            @RequestParam @NotBlank @Email String email
    ) {

        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.isEnabled() && user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Account is already activated.");
        }

        var newToken = accountActivationService.resendActivation(user);

        String activationLink = activationBaseUrl + "/activate?token=" + newToken.getToken();

        emailService.sendAccountActivationEmail(user, activationLink);

        return ApiResponse.success("Activation email resent successfully.");
    }
}

