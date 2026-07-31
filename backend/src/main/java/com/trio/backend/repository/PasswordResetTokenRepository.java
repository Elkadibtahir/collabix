package com.trio.backend.repository;

import com.trio.backend.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    /**
     * Resorteves a token by its value.
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Resorteves a token valid :
     * <ul>
     *     <li>non used ({@code used = false})</li>
     *     <li>non expiresd ({@code expiresAt > now})</li>
     * </ul>
     */
    @Query("SELECT p FROM PasswordResetToken p " +
            "WHERE p.token = :token " +
            "AND p.used = false " +
            "AND p.expiresAt > :now")
    Optional<PasswordResetToken> findValidToken(
            @Param("token") String token,
            @Param("now") Instant now
    );

    /**
     * Resorteves the last token non used of a user.
     */
    Optional<PasswordResetToken> findFirstByUser_IdAndUsedFalseOrderByCreatedAtDesc(UUID userId);

    /**
     * Verifies si un user possÃ¨de dÃ©jÃ  un token de reset valid
     * (non used, non expiresd).
     */
    @Query("SELECT COUNT(p) > 0 FROM PasswordResetToken p " +
            "WHERE p.user.id = :userId " +
            "AND p.used = false " +
            "AND p.expiresAt > :now")
    boolean existsValidTokenByUser_Id(
            @Param("userId") UUID userId,
            @Param("now") Instant now
    );

    /**
     * Invalid all tokens valids of a user en les marquant comme useds.
     * <p>UtilisÃ© avant generation d'a new token pour guarantee
     * qu'un seul token valid existe par user.</p>
     */
    @Modifying
    @Query("UPDATE PasswordResetToken p SET p.used = true, p.usedAt = :now " +
            "WHERE p.user.id = :userId " +
            "AND p.used = false " +
            "AND p.expiresAt > :now")
    void invalidatePreviousTokens(
            @Param("userId") UUID userId,
            @Param("now") Instant now
    );

    /**
     * Resorteves all the tokens non useds et expiresds.
     * <p>UtilisÃ© par le job de nettoyage scheduled pour marquer
     * automaticment the tokens expiresds.</p>
     */
    @Query("SELECT p FROM PasswordResetToken p " +
            "WHERE p.used = false " +
            "AND p.expiresAt <= :now " +
            "ORDER BY p.expiresAt ASC")
    List<PasswordResetToken> findAllExpiredUnused(@Param("now") Instant now);

    /**
     * Verifies si un token existe.
     */
    boolean existsByToken(String token);
}

