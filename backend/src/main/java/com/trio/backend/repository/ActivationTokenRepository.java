package com.trio.backend.repository;

import com.trio.backend.entity.ActivationToken;
import com.trio.backend.entity.ActivationToken.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivationTokenRepository extends JpaRepository<ActivationToken, UUID> {

    /**
     * Resorteves a token by its value.
     */
    Optional<ActivationToken> findByToken(String token);

    /**
     * Resorteves all the tokens of a user.
     */
    List<ActivationToken> findAllByUser_IdOrderByCreatedAtDesc(UUID userId);

    /**
     * Resorteves all the tokens of a user with pagination.
     */
    Page<ActivationToken> findAllByUser_Id(UUID userId, Pageable pageable);

    /**
     * Resorteves the tokens ACTIVE of a user.
     */
    List<ActivationToken> findAllByUser_IdAndStatusOrderByCreatedAtDesc(UUID userId, Status status);

    /**
     * Verifies si un token existe.
     */
    boolean existsByToken(String token);

    /**
     * Verifies si un user possÃ¨de dÃ©jÃ  un token ACTIVE.
     */
    boolean existsByUser_IdAndStatus(UUID userId, Status status);

    /**
     * Resorteves the tokens expiresds (expiresss_at avant une date given, status ACTIVE).
     * UtilisÃ© par le job de nettoyage scheduled.
     */
    @Query("SELECT a FROM ActivationToken a " +
            "WHERE a.expiresAt < :now " +
            "AND a.status = :status " +
            "ORDER BY a.expiresAt ASC")
    List<ActivationToken> findExpiredTokens(
            @Param("now") Instant now,
            @Param("status") Status status
    );

    /**
     * Resorteves the tokens expiresds with pagination.
     */
    @Query("SELECT a FROM ActivationToken a " +
            "WHERE a.expiresAt < :now " +
            "AND a.status = :status " +
            "ORDER BY a.expiresAt ASC")
    Page<ActivationToken> findExpiredTokens(
            @Param("now") Instant now,
            @Param("status") Status status,
            Pageable pageable
    );

    /**
     * Resorteves the tokens useds (status USED).
     * UtilisÃ© pour l'audit et l'history.
     */
    List<ActivationToken> findAllByStatusOrderByUsedAtDesc(Status status);

    /**
     * Resorteves the tokens useds with pagination.
     */
    Page<ActivationToken> findAllByStatus(Status status, Pageable pageable);

    /**
     * Resorteves all the tokens pour un report/statistics over a period.
     */
    @Query("SELECT a FROM ActivationToken a " +
            "WHERE a.createdAt BETWEEN :from AND :to " +
            "ORDER BY a.createdAt DESC")
    List<ActivationToken> findAllByCreatedAtBetween(
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    /**
     * Counts the namebre total de tokens par status.
     */
    long countByStatus(Status status);

    /**
     * Counts the namebre de tokens created over a period.
     */
    long countByCreatedAtBetween(Instant from, Instant to);

    /**
     * Resorteves the tokens of a user pour l'history of activation.
     */
    @Query("SELECT a FROM ActivationToken a " +
            "WHERE a.user.id = :userId " +
            "ORDER BY a.createdAt DESC")
    List<ActivationToken> findHistoryByUser_Id(@Param("userId") UUID userId);

    /**
     * Resorteves the history of activation of a user with pagination.
     */
    @Query("SELECT a FROM ActivationToken a " +
            "WHERE a.user.id = :userId " +
            "ORDER BY a.createdAt DESC")
    Page<ActivationToken> findHistoryByUser_Id(@Param("userId") UUID userId, Pageable pageable);
}

