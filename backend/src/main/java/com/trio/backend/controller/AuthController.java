package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.auth.ChangePasswordRequest;
import com.trio.backend.dto.auth.ForgotPasswordRequest;
import com.trio.backend.dto.auth.LoginRequest;
import com.trio.backend.dto.auth.LoginResponse;
import com.trio.backend.dto.auth.RefreshTokenRequest;
import com.trio.backend.dto.auth.RefreshTokenResponse;

import com.trio.backend.dto.user.UserResponse;
import com.trio.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Authentifie un user.
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        return ApiResponse.success(
                "Login successful.",
                authService.login(request)
        );
    }

    /**
     * Generates a new couple de tokens.
     */
    @PostMapping("/refresh")
    public ApiResponse<RefreshTokenResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request
    ) {

        return ApiResponse.success(
                "Token refreshed successfully.",
                authService.refreshToken(request)
        );
    }

    /**
     * DÃ©connecte the user.
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @Valid @RequestBody RefreshTokenRequest request
    ) {

        authService.logout(request.getRefreshToken());

        return ApiResponse.success(
                "Logout successful."
        );
    }

    /**
     * Returns the user connected.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserResponse> me() {

        return ApiResponse.success(
                "Authenticated user resorteved successfully.",
                authService.me()
        );
    }

    /**
     * Initie une request de reset de mot de passe.
     *
     * <p>Returns toudays une response generic de success, que l'email
     * existe ou non, in order to ne pas rÃ©vÃ©ler d'information sur les comptes
     * existants.</p>
     *
     * @param request the request containing l'address email
     * @return une response generic de success
     */
    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {

        authService.requestPasswordReset(request.getEmail());

        return ApiResponse.success(
                "If an account with that email exists, a password reset link has been sent."
        );
    }

    /**
     * Resets le mot de passe of a user Ã  l'aide d'un token valid.
     *
     * <p>Valid the token de reset, met Ã  jour le mot de passe,
     * marque the token comme used et invalid all others tokens
     * actives du same user.</p>
     *
     * <p>Le controleur ne contains aucune logical mÃ©tier.</p>
     *
     * @param request the request containing the token, le nouveau mot de passe et sa confirmation
     * @return une response standard de success
     */
    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(
            @Valid @RequestBody com.trio.backend.dto.auth.ResetPasswordRequest request
    ) {

        authService.resetPassword(request);

        return ApiResponse.success("Password has been reset successfully.");
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(request);
        return ApiResponse.success("Password changed successfully.");
    }

}
