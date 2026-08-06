package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * HandoverEntry represents a handover handed over by a sender to a receiver.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>HandoverEntry belongs to exactly one Workspace and exactly one Department and exactly one Project.</li>
 *     <li>Task is optional and can be associated for task-level handover context.</li>
 *     <li>The author is the {@code sender}; the {@code receiver} is the person the handover is handed to.</li>
 *     <li>Lifecycle: DRAFT -&gt; PENDING (sent) -&gt; ACCEPTED | REJECTED -&gt; COMPLETED; ARCHIVED for soft archiving.</li>
 *     <li>Soft-delete is handled via the {@code deleted} flag.</li>
 * </ul>
 */
@Entity
@Table(
        name = "handover_entries",
        indexes = {
                @Index(name = "idx_handover_entries_workspace_id", columnList = "workspace_id"),
                @Index(name = "idx_handover_entries_department_id", columnList = "department_id"),
                @Index(name = "idx_handover_entries_project_id", columnList = "project_id"),
                @Index(name = "idx_handover_entries_sender_id", columnList = "sender_id"),
                @Index(name = "idx_handover_entries_receiver_id", columnList = "receiver_id"),
                @Index(name = "idx_handover_entries_task_id", columnList = "task_id"),
                @Index(name = "idx_handover_entries_status", columnList = "status"),
                @Index(name = "idx_handover_entries_priority", columnList = "priority"),
                @Index(name = "idx_handover_entries_due_date", columnList = "due_date"),
                @Index(name = "idx_handover_entries_sent_at", columnList = "sent_at"),
                @Index(name = "idx_handover_entries_deleted", columnList = "deleted"),
                @Index(name = "idx_handover_entries_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@BatchSize(size = 20)
public class HandoverEntry extends AuditableEntity {

    /**
     * Workspace owning this handover. Required.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false, updatable = false)
    private Workspace workspace;

    /**
     * Department owning this handover. Required.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false, updatable = false)
    private Department department;

    /**
     * Project context for this handover. Required.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false, updatable = false)
    private Project project;

    /**
     * Optional task context for this handover.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "task_id", nullable = true, updatable = false)
    private Task task;

    /**
     * Sender (author of the handover). Required.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false, updatable = false)
    private User sender;

    /**
     * Receiver (person the handover is handed to). Required.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    // =========================================================================
    // Workflow fields
    // =========================================================================

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @NotBlank(message = "Content is required")
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @NotNull(message = "Priority is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private Priority priority = Priority.MEDIUM;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private HandoverStatus status = HandoverStatus.DRAFT;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    // =========================================================================
    // Lifecycle timestamps
    // =========================================================================

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    /**
     * Soft delete flag.
     */
    @NotNull
    @Column(name = "deleted", nullable = false)
    private Boolean deleted = false;

    @PrePersist
    @PreUpdate
    private void validateHierarchy() {
        if (priority == null) {
            priority = Priority.MEDIUM;
        }
        if (status == null) {
            status = HandoverStatus.DRAFT;
        }
        if (deleted == null) {
            deleted = false;
        }

        Objects.requireNonNull(workspace, "workspace must not be null");
        Objects.requireNonNull(department, "department must not be null");
        Objects.requireNonNull(project, "project must not be null");
        Objects.requireNonNull(sender, "sender must not be null");
        Objects.requireNonNull(receiver, "receiver must not be null");
        if (!Objects.equals(department.getId(), project.getDepartment().getId())) {
            throw new IllegalStateException("HandoverEntry.department must match project.department");
        }
        if (!Objects.equals(workspace.getId(), project.getDepartment().getWorkspace().getId())) {
            throw new IllegalStateException("HandoverEntry.workspace must match project.department.workspace");
        }
        if (Objects.equals(sender.getId(), receiver.getId())) {
            throw new IllegalStateException("HandoverEntry.sender and receiver must be different users");
        }
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    public enum HandoverStatus {
        DRAFT,
        PENDING,
        ACCEPTED,
        REJECTED,
        COMPLETED,
        ARCHIVED
    }
}
