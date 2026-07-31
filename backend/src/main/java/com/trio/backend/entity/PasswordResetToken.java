package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

/**
 * PasswordResetToken représente un token à usage unique permettant
 * à un utilisateur de réinitialiser son mot de passe oublié.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>Un token appartient à exactement un {@link User}.</li>
 *     <li>Un utilisateur peut avoir plusieurs tokens au fil du temps (historique).</li>
 *     <li>Un token est soit utilisé ({@code used = true}), soit expiré (via {@code expiresAt}).</li>
 *     <li>Le token est totalement indépendant du module JWT.</li>
 *     <li>Le champ {@code regenerationCount} permet de suivre les régénérations
 *     et de limiter le nombre de tokens valides simultanés.</li>
 *     <li>La suppression physique n'est pas nécessaire : un token est marqué utilisé ou expiré.</li>
 * </ul>
 *
 * @see User
 */
@Entity
@Table(
        name = "password_reset_tokens",
        indexes = {
                @Index(name = "idx_prt_token", columnList = "token"),
                @Index(name = "idx_prt_user_id", columnList = "user_id"),
                @Index(name = "idx_prt_expires_at", columnList = "expires_at"),
                @Index(name = "idx_prt_user_used", columnList = "user_id, used")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken extends AuditableEntity {

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

    /**
     * Date à laquelle le token a été utilisé pour réinitialiser le mot de passe.
     * {@code null} tant que le token n'a pas été consommé.
     */
    @Column(name = "used_at")
    private Instant usedAt;

    /**
     * Indique si le token a été utilisé.
     * <p>Un token utilisé ne peut plus servir à réinitialiser un mot de passe.</p>
     */
    @Builder.Default
    @Column(name = "used", nullable = false)
    private boolean used = false;

    /**
     * Nombre de fois que ce token a été régénéré.
     * <p>Permet de tracer les demandes de nouveau lien de réinitialisation
     * et d'implémenter une limite de régénérations si nécessaire.</p>
     */
    @Builder.Default
    @Column(name = "regeneration_count", nullable = false)
    private int regenerationCount = 0;
}

