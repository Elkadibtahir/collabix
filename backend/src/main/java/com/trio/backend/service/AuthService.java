package com.trio.backend.service;

import com.trio.backend.dto.auth.ChangePasswordRequest;
import com.trio.backend.dto.auth.CompleteActivationRequest;
import com.trio.backend.dto.auth.LoginRequest;
import com.trio.backend.dto.auth.LoginResponse;
import com.trio.backend.dto.auth.RefreshTokenRequest;
import com.trio.backend.dto.auth.RefreshTokenResponse;

import com.trio.backend.dto.user.UserResponse;
import com.trio.backend.entity.User;

import java.util.UUID;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    RefreshTokenResponse refreshToken(RefreshTokenRequest request);

    void logout(String refreshToken);

    UserResponse me();

/**
     * Finalise l'activation d'un compte user.
     *
     * <p>Valid the token of activation, encode le mot de passe proemptyd,
     * active le compte ({@code enabled = true, status = ACTIVE}) et
     * marque the token comme used.</p>
     *
     * @param request the request containing the token of activation, le mot de passe et sa confirmation
     */
    void completeActivation(CompleteActivationRequest request);

/**
     * Initie une request de reset de mot de passe.
     *
     * <p>Delegates Ã  {@link PasswordResetService} pour verifiesr the user,
     * generate un token de reset et send un email.
     * Returns toudays une response generic pour ne pas rÃ©vÃ©ler
     * si l'email existe ou non.</p>
     *
     * @param email l'address email de the user demandant la reset
     */
    void requestPasswordReset(String email);

    /**
     * Resets le mot de passe of a user Ã  partir d'un token valid.
     *
     * <p>Delegates Ã  {@link PasswordResetService} pour validate the token,
     * encode le nouveau mot de passe et le persister.</p>
     *
     * @param request the request containing the token de reset, le nouveau mot de passe et sa confirmation
     */
    void resetPassword(com.trio.backend.dto.auth.ResetPasswordRequest request);

    // ---------------------------------------------------------------
    // Login Security (Brute-Force Protection)
    // ---------------------------------------------------------------

    /**
     * Changes the password for the currently authenticated user.
     *
     * <p>Validates the current password, ensures the new password matches
     * the confirmation, encodes the new password, and persists it.</p>
     *
     * @param request the request containing current password, new password, and confirmation
     */
    void changePassword(ChangePasswordRequest request);

    /**
     * Registers a failed login attempt for the given user.
     *
     * <p>Increments the {@code failedLoginAttempts} counter. If the counter
     * reaches the configured maximum, the account is locked:
     * {@code status = LOCKED}, {@code lockedAt = now()}, and all active
     * refresh tokens are revoked.</p>
     *
     * @param user the user whose login attempt failed
     */
    void registerFailedLoginAttempt(User user);

    /**
     * Resets the login attempt counter for the given user after a
     * successful login.
     *
     * <p>Sets {@code failedLoginAttempts = 0}, clears {@code lockedAt},
     * and updates {@code lastLoginAt}.</p>
     *
     * @param user the user who logged in successfully
     */
    void resetLoginAttempts(User user);

/**
     * Unlocks a locked user account.
     *
     * <p>Resets {@code failedLoginAttempts} to 0, clears {@code lockedAt},
     * restores {@code status} to {@code ACTIVE}, and revokes all active
     * refresh tokens for the user.</p>
     *
     * @param userId the UUID of the user to unlock
     */
    void unlockAccount(UUID userId);

    // ---------------------------------------------------------------
    // Automatic Account Unlock
    // ---------------------------------------------------------------

    /**
     * Checks whether the lock duration has expiressd and the account is
     * eligible for automatic unlocking.
     *
     * <p>An account is eligible for automatic unlocking when all of the
     * following conditions are met:</p>
     * <ul>
     *   <li>Automatic unlock is enabled in configuration</li>
     *   <li>The user's status is {@code LOCKED}</li>
     *   <li>{@code lockedAt} is not null</li>
     *   <li>The elapsed time since {@code lockedAt} exceeds the configured
     *       {@code lockDuration}</li>
     * </ul>
     *
     * @param user the user to check
     * @return {@code true} if the account can be automatically unlocked
     */
    boolean canAutoUnlock(User user);

    /**
     * Automatically unlocks a locked user account.
     *
     * <p>Resets {@code failedLoginAttempts} to 0, clears {@code lockedAt},
     * and restores {@code status} to {@code ACTIVE}. Unlike the manual
     * unlock, this method does <strong>not</strong> revoke refresh tokens,
     * because the user is actively authenticating and will receive a fresh
     * token pair upon successful login.</p>
     *
     * <p>This method is intended to be called from within the login flow
     * after {@link #canAutoUnlock(User)} returns {@code true}.</p>
     *
     * @param user the user to unlock
     */
    void autoUnlockAccount(User user);

}
