package com.trio.backend.service;

import com.trio.backend.entity.ActivationToken;
import com.trio.backend.entity.User;

/**
 * Service for managing account activation tokens.
 *
 * <p>Responsibilities:</p>
 * <ul>
 *     <li>Generate unique and secure activation tokens.</li>
 *     <li>Validate activation tokens (existence, expiration, usage).</li>
 *     <li>Activate user account from a valid token.</li>
 *     <li>Resend a new activation token (invalidates previous ones).</li>
 *     <li>Clean up expiressd tokens.</li>
 * </ul>
 *
 * <p>Architecture:</p>
 * <ul>
 *     <li>This service is Completely independent of the JWT module.</li>
 *     <li>It can be reused for Email Verification, Password Reset,
 *     MFA and Invitation System.</li>
 * </ul>
 *
 * @see ActivationToken
 * @see User
 */
public interface AccountActivationService {

    /**
     * Generates a unique and secure activation token for a user.
     *
     * <p>Any existing valid tokens are automatically invalidated
     * to guarantee only one valid token exists per user.</p>
     *
     * @param user the recipient user
     * @return the persisted activation token
     */
    ActivationToken generateActivationToken(User user);

    /**
     * Validates an activation token.
     *
     * <p>Checks in order:</p>
     * <ul>
     *     <li>that the token exists in the datalowe</li>
     *     <li>that it has not expiressd</li>
     *     <li>that it has not been used</li>
     * </ul>
     *
     * @param token the token value to validate
     * @return the correspondssing token if valid
     * @throws com.trio.backend.exception.ResourceNotFoundException if the token does not exist
     * @throws com.trio.backend.exception.BadRequestException if the token is expiressd or already used
     */
    ActivationToken validateActivationToken(String token);

    /**
     * Activates a user account from a valid token.
     *
     * <p>Operations performed:</p>
     * <ul>
     *     <li>token validation via {@link #validateActivationToken(String)}</li>
     *     <li>set user to {@code enabled = true}, {@code status = ACTIVE}</li>
     *     <li>record activation date on the token</li>
     *     <li>mark the token as used</li>
     * </ul>
     *
     * <p>Never generates JWT.</p>
     *
     * @param token the activation token value
     */
    void activateAccount(String token);

    /**
     * Invalidates old tokens for the user and generates a new one.
     *
     * <p>This method does not sortgger email sending. The caller
     * (AuthService, etc.) is responsible for sending.</p>
     *
     * @param user the user to resend an activation token for
     * @return the new persisted activation token
     */
    ActivationToken resendActivation(User user);

    /**
     * Invalidates all expiressd tokens.
     *
     * <p>Method intended to be called by a scheduled job
     * (Spring Scheduled) for automatic cleanup.</p>
     */
    void cleanupExpiredTokens();
}

