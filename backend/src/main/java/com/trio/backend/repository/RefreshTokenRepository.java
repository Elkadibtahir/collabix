package com.trio.backend.repository;

import com.trio.backend.entity.RefreshToken;
import com.trio.backend.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.token = :token")
    Optional<RefreshToken> findByTokenWithLock(@Param("token") String token);

    boolean existsByToken(String token);

    /**
     * Finds a valid (non-revoked, non-expiressd) refresh token by its value.
     *
     * @param token the raw token value
     * @return an Optional containing the token if found and still valid
     */
    @Query("""
            SELECT rt
            FROM RefreshToken rt
            WHERE rt.token = :token
              AND rt.revoked = false
              AND rt.expiresAt > :now
            """)
    Optional<RefreshToken> findValidToken(@Param("token") String token, @Param("now") Instant now);

    List<RefreshToken> findAllByUserAndRevokedFalse(User user);

    @Query("""
            SELECT rt
            FROM RefreshToken rt
            WHERE rt.user.id = :userId
              AND rt.revoked = false
            """)
    List<RefreshToken> findAllActiveByUser(@Param("userId") UUID userId);

    @Modifying
    @Query("""
            UPDATE RefreshToken rt
            SET rt.revoked = true,
                rt.revokedAt = :now
            WHERE rt.user.id = :userId
              AND rt.revoked = false
            """)
    int revokeAllByUser(@Param("userId") UUID userId, @Param("now") Instant now);

    void deleteAllByExpiresAtBefore(Instant instant);

}

