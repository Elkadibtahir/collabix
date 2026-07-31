package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.CommentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;




/**
 * Comment represents a communication item attached to a {@link Task}.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>A Comment belongs to exactly one Task.</li>
 *     <li>Tenant isolation is ensured through the chain: Comment -> Task -> Project -> Department -> Workspace.</li>
 *     <li>This entity is designed as an MVP foundation. Future nested/threaded replies
 *     (thread comments) are prepared conceptually via fields, but not implemented here.</li>
 * </ul>
 */
@Entity
@Table(
        name = "comments",
        indexes = {
                @Index(name = "idx_comments_task_id", columnList = "task_id"),
                @Index(name = "idx_comments_task_status", columnList = "task_id, status"),
                @Index(name = "idx_comments_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @NotBlank
    @Size(max = 100000)
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CommentStatus status = CommentStatus.ACTIVE;


    /**
     * Minimal foundation for future "thread comments".
     *
     * <p>When not null, indicates that this comment is a reply to another comment.
     * Nested replies and constraints are intentionally not enforced here (no relationships
     * beyond the scalar id).</p>
     */
    @Column(name = "parent_comment_id")
    private UUID parentCommentId;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = CommentStatus.ACTIVE;
        }
    }
}

