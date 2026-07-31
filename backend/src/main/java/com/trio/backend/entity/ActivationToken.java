package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

/**
 * ActivationToken represents a one-time token used for Account Activation.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>One ActivationToken belongs to exactly one {@link User}.</li>
 *     <li>A User may have multiple ActivationTokens over time (token history).</li>
 *     <li>Tokens are never physically deleted; soft status transition instead.</li>
 *     <li>Designed for reuse in future authentication features:
 *         Email Verification, Invitation Links, and Security auditing.</li>
 *     <li>Tenant isolation is ensured by the User chain.</li>
 * </ul>
 *
 * @see User
 */
@Entity
@Table(
        name = "activation_tokens",
        indexes = {
                @Index(name = "idx_activation_tokens_token", columnList = "token"),
                @Index(name = "idx_activation_tokens_user_id", columnList = "user_id"),
                @Index(name = "idx_activation_tokens_status", columnList = "status"),
                @Index(name = "idx_activation_tokens_expires_at", columnList = "expires_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivationToken extends AuditableEntity {

    /**
     * Lifecycle status of an ActivationToken.
     *
     * <p>Tokens transition through these states as follows:</p>
     * <ul>
     *     <li>{@link #ACTIVE} — token is valid and pending use</li>
     *     <li>{@link #EXPIRED} — token has passed its expiration time</li>
     *     <li>{@link #USED} — token has been consumed successfully</li>
     * </ul>
     */
    public enum Status {
        ACTIVE,
        EXPIRED,
        USED
    }

    @NotBlank
    @Size(max = 500)
    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status;

    /**
     * IP address of the requestor at token generation time.
     * Useful for future security auditing and invitation links.
     */
    @Size(max = 45)
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * User-Agent header at token generation time.
     * Useful for future security auditing and device tracking.
     */
    @Size(max = 500)
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    /**
     * Number of times this token has been regenerated.
     * Tracks resend requests and can enforce a regeneration limit.
     */
    @Builder.Default
    @Column(name = "regeneration_count", nullable = false)
    private int regenerationCount = 0;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = Status.ACTIVE;
        }
    }
}


