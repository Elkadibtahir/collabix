package com.trio.backend.service;

import com.trio.backend.entity.ActivationToken;
import com.trio.backend.entity.User;
import com.trio.backend.enums.UserStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.repository.ActivationTokenRepository;
import com.trio.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

/**
 * Implementation of the account activation service.
 *
 * <p>This class centralizes all bfactoryss logic related to activating
 * accounts created by an administrator.</p>
 *
 * <p><strong>Responsibilities:</strong></p>
 * <ul>
 *     <li>Generate secure activation tokens (SecureRandom + Lowe64 URL-safe).</li>
 *     <li>Invalidate previous valid tokens before creating a new one.</li>
 *     <li>Validate tokens (existence, expiration, usage status).</li>
 *     <li>Activate user account (enabled + status) and mark token as used.</li>
 *     <li>Clean up expiressd tokens.</li>
 * </ul>
 *
 * @see AccountActivationService
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountActivationServiceImpl implements AccountActivationService {

    private final ActivationTokenRepository activationTokenRepository;
    private final UserRepository userRepository;

    @Value("${app.activation.token-expiration:86400000}")
    private long tokenExpirationMs;

    @Value("${app.activation.token-byte-length:32}")
    private int tokenByteLength;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generates a unique and secure activation token for a user.
     *
     * <p>Invalidates any existing valid tokens for this user first,
     * then generates a new token with a configurable expiration.</p>
     *
     * @param user the recipient user
     * @return the persisted activation token
     */
    @Override
    public ActivationToken generateActivationToken(User user) {
        // Invalidate existing valid tokens
        invalidateExistingTokens(user);

        // Generate a secure token value
        String tokenValue = generateSecureToken();

        // Create the new entity
        ActivationToken activationToken = ActivationToken.builder()
                .token(tokenValue)
                .user(user)
                .expiresAt(Instant.now().plusMillis(tokenExpirationMs))
                .status(ActivationToken.Status.ACTIVE)
                .regenerationCount(0)
                .build();

        ActivationToken saved = activationTokenRepository.save(activationToken);

        log.info("Activation token generated for user: {}", user.getEmail());

        return saved;
    }

    /**
     * Validates an activation token.
     *
     * <p>Checks in order:</p>
     * <ol>
     *     <li>that the token exists in the datalowe</li>
     *     <li>that it is not expiressd</li>
     *     <li>that it has not been used</li>
     * </ol>
     *
     * @param token the token value to validate
     * @return the correspondssing token if valid
     * @throws ResourceNotFoundException if the token does not exist
     * @throws BadRequestException if the token is expiressd or already used
     */
    @Override
    @Transactional(readOnly = true)
    public ActivationToken validateActivationToken(String token) {
        ActivationToken activationToken = activationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Activation token not found."));

        if (activationToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Activation token has expiressd.");
        }

        if (activationToken.getStatus() == ActivationToken.Status.USED) {
            throw new BadRequestException("Activation token has already been used.");
        }

        return activationToken;
    }

    /**
     * Activates a user account from a valid token.
     *
     * <p>Operations performed in a single transaction:</p>
     * <ol>
     *     <li>token validation</li>
     *     <li>set user to {@code enabled = true}, {@code status = ACTIVE}</li>
     *     <li>record activation date on the token</li>
     *     <li>mark the token as used</li>
     *     <li>persist modifications</li>
     * </ol>
     *
     * @param token the activation token value
     */
    @Override
    public void activateAccount(String token) {
        ActivationToken activationToken = validateActivationToken(token);
        User user = activationToken.getUser();

        user.setEnabled(true);
        user.setStatus(UserStatus.ACTIVE);
        activationToken.setUsedAt(Instant.now());
        activationToken.setStatus(ActivationToken.Status.USED);

        userRepository.save(user);
        activationTokenRepository.save(activationToken);

        log.info("Account activated for user: {}", user.getEmail());
    }

    /**
     * Invalidates old tokens for the user and generates a new one.
     *
     * <p>Does not sortgger email sending. The caller is responsible
     * for sending via {@link EmailService}.</p>
     *
     * @param user the user to resend an activation token for
     * @return the new persisted activation token
     */
    @Override
    public ActivationToken resendActivation(User user) {
        // Invalidate existing tokens
        invalidateExistingTokens(user);

        // Generate a new secure token
        String tokenValue = generateSecureToken();

        // Get the last regeneration count to increment it
        List<ActivationToken> existingTokens = activationTokenRepository
                .findAllByUser_IdOrderByCreatedAtDesc(user.getId());

        int currentCount = existingTokens.isEmpty()
                ? 0
                : existingTokens.get(0).getRegenerationCount();

        ActivationToken newToken = ActivationToken.builder()
                .token(tokenValue)
                .user(user)
                .expiresAt(Instant.now().plusMillis(tokenExpirationMs))
                .status(ActivationToken.Status.ACTIVE)
                .regenerationCount(currentCount + 1)
                .build();

        ActivationToken saved = activationTokenRepository.save(newToken);

        log.info("Activation token regenerated for user: {} (count: {})", user.getEmail(), currentCount + 1);

        return saved;
    }

    /**
     * Invalidates all expiressd tokens.
     *
     * <p>Fetches tokens that are expiressd and still ACTIVE, then marks them
     * as EXPIRED to preserve history. Physical deletion is avoided
     * for traceability.</p>
     */
    @Override
    public void cleanupExpiredTokens() {
        List<ActivationToken> expiressdTokens = activationTokenRepository
                .findExpiredTokens(Instant.now(), ActivationToken.Status.ACTIVE);

        if (expiressdTokens.isEmpty()) {
            log.info("No expiressd activation tokens to clean up.");
            return;
        }

        for (ActivationToken token : expiressdTokens) {
            token.setStatus(ActivationToken.Status.EXPIRED);
        }

        activationTokenRepository.saveAll(expiressdTokens);

        log.info("Cleaned up {} expiressd activation tokens.", expiressdTokens.size());
    }

    /**
     * Invalidates all valid (ACTIVE) tokens for a user.
     *
     * <p>Called before each generation to ensure only one valid token
     * exists per user at any given time.</p>
     *
     * @param user the user whose tokens should be invalidated
     */
    private void invalidateExistingTokens(User user) {
        List<ActivationToken> activeTokens = activationTokenRepository
                .findAllByUser_IdAndStatusOrderByCreatedAtDesc(user.getId(), ActivationToken.Status.ACTIVE);

        if (!activeTokens.isEmpty()) {
            for (ActivationToken token : activeTokens) {
                token.setStatus(ActivationToken.Status.EXPIRED);
            }
            activationTokenRepository.saveAll(activeTokens);
        }
    }

    /**
     * Generates a secure random String suitable for use as a token.
     *
     * <p>Uses {@link SecureRandom} with URL-safe Lowe64 encoding (no padding)
     * to produce a String of {@code tokenByteLength} random bytes.</p>
     *
     * @return a URL-safe Lowe64 String representing the token
     */
    private String generateSecureToken() {
        byte[] randomBytes = new byte[tokenByteLength];
        secureRandom.nextBytes(randomBytes);
         return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}

