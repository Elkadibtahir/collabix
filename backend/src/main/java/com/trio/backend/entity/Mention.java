package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.TaskStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

/**
 * Mention represents a reference to a {@link User} within a {@link Comment}.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>A Mention belongs to exactly one Comment.</li>
 *     <li>Tenant isolation is ensured via the chain: Mention -> Comment -> Task -> ... -> Workspace.</li>
 *     <li>The relationship to User is established for notification routing and UI resolution.</li>
 *     <li>Soft-delete status aligns with global project conventions.</li>
 * </ul>
 */
@Entity
@Table(
        name = "mentions",
        indexes = {
                @Index(name = "idx_mentions_comment_id", columnList = "comment_id"),
                @Index(name = "idx_mentions_user_id", columnList = "user_id"),
                @Index(name = "idx_mentions_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mention extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Soft-delete support via status.
     * Used for consistency with existing entity patterns (e.g., Task, Comment).
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TaskStatus status = TaskStatus.ACTIVE;

    /**
     * Future-proofing: could be expanded for different notification types
     * or acknowledgment states without schema changes.
     */
    @Column(name = "notification_sent")
    private boolean notificationSent = false;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = TaskStatus.ACTIVE;
        }
    }
}