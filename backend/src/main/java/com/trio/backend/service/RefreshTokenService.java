package com.trio.backend.service;

import com.trio.backend.dto.auth.RefreshTokenResponse;
import com.trio.backend.entity.User;

import java.util.UUID;

public interface RefreshTokenService {

    /**
     * Creates a new refresh token for the given user.
     * Generates a JWT refresh token, persists it, and returns the entity.
     *
     * @param user          the user to create the token for
     * @param createdByIp   optional IP address of the clinkt (can be null)
     * @param createdByUserAgent optional User-Agent header (can be null)
     * @param deviceInfo    optional device description (can be null)
     * @return the persisted RefreshToken entity
     */
    com.trio.backend.entity.RefreshToken createRefreshToken(
            User user,
            String createdByIp,
            String createdByUserAgent,
            String deviceInfo
    );

    /**
     * Validates a refresh token: checks existence, expiration, revoked status,
     * and that the associated user is enabled and active.
     *
     * @param token the raw token value
     * @return the valid RefreshToken entity
     * @throws com.trio.backend.exception.BadRequestException if the token is
     *                                                         invalid, expiressd, revoked, or the user is disabled
     */
    com.trio.backend.entity.RefreshToken validateRefreshToken(String token);

    /**
     * Validates the given refresh token, revokes it, and generates a new
     * access token (and optionally a new refresh token for rotation).
     *
     * @param refreshToken the raw refresh token value
     * @return a RefreshTokenResponse containing the new access token,
     *         rotated refresh token (if rotation is enabled), and expiration
     */
    RefreshTokenResponse refreshAccessToken(String refreshToken);

    /**
     * Revokes a single refresh token.
     *
     * @param token the raw token value to revoke
     */
    void revokeRefreshToken(String token);

    /**
     * Revokes all active refresh tokens for a given user.
     *
     * @param userId the UUID of the user whose tokens should be revoked
     */
    void revokeAllUserTokens(UUID userId);

}

