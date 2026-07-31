package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * REST controller for administrative user management operations.
 *
 * <p>This controller is intentionally separated from {@link AuthController}
 * to maintain a clear boundary between authentication concerns (login, logout,
 * register, refresh token, password reset) and administration concerns (unlock,
 * suspend, etc.).</p>
 *
 * <p>All endpoints require the {@code ADMIN} role.</p>
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin User Management", description = "Administrative operations on user accounts")
@SecurityRequirement(name = "bearerAuth")
public class AdminUserController {

    private final AuthService authService;

    /**
     * Unlocks a locked user account.
     *
     * <p>Resets {@code failedLoginAttempts} to 0, clears {@code lockedAt},
     * and restores the user's {@code status} to {@code ACTIVE}.
     * All active refresh tokens for the user are also revoked to
     * invalidate any lingering sessions.</p>
     *
     * @param userId the UUID of the user to unlock
     * @return a generic success response
     */
    @Operation(
            summary = "Unlock a user account",
            description = "Resets failed login attempts, clears the lock timestamp, restores status to ACTIVE, and revokes all active refresh tokens."
    )
    @PostMapping("/{userId}/unlock")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'ADMIN_USER_UNLOCK')")
    public ApiResponse<Void> unlockAccount(@PathVariable UUID userId) {

        authService.unlockAccount(userId);

        return ApiResponse.success("Account has been unlocked successfully.");
    }

}
