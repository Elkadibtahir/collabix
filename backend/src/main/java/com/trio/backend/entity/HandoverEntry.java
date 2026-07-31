package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * HandoverEntry represents a handover form filled by a single user at the end of their shift.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>HandoverEntry belongs to exactly one Workspace and exactly one Department and exactly one Project.</li>
 *     <li>HandoverEntry belongs to exactly one User (the author of the form).</li>
 *     <li>Task is optional and can be associated for task-level handover context.</li>
 *     <li>Soft-delete is handled via status.</li>
 *     <li>Prepared for future enhancements: AI summary, PDF export, analytics, history, search, manager validation.</li>
 * </ul>
 */
@Entity
@Table(
        name = "handover_entries",
        indexes = {
                @Index(name = "idx_handover_entries_workspace_id", columnList = "workspace_id"),
                @Index(name = "idx_handover_entries_department_id", columnList = "department_id"),
                @Index(name = "idx_handover_entries_project_id", columnList = "project_id"),
                @Index(name = "idx_handover_entries_user_id", columnList = "user_id"),
                @Index(name = "idx_handover_entries_task_id", columnList = "task_id"),
                @Index(name = "idx_handover_entries_status", columnList = "status"),
                @Index(name = "idx_handover_entries_shift", columnList = "shift"),
                @Index(name = "idx_handover_entries_passed_at", columnList = "passed_at"),
                @Index(name = "idx_handover_entries_created_at", columnList = "created_at"),
                @Index(name = "idx_handover_entries_manager_validation_status", columnList = "manager_validation_status")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_handover_entries_user_project_passed_at",
                        columnNames = {"user_id", "project_id", "passed_at"}
                )
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
     * Workspace owning this handover.
     * Required.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false, updatable = false)
    private Workspace workspace;

    /**
     * Department owning this handover.
     * Required.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false, updatable = false)
    private Department department;

    /**
     * Project context for this handover.
     * Required.
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
     * Author (user who filled the handover form).
     * Required.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    // =========================================================================
    // Form fields (required business data)
    // =========================================================================

    @NotBlank(message = "Work finished is required")
    @Column(name = "work_finished", nullable = false, columnDefinition = "TEXT")
    private String workFinished;

    @NotBlank(message = "Work remaining is required")
    @Column(name = "work_remaining", nullable = false, columnDefinition = "TEXT")
    private String workRemaining;

    @NotBlank(message = "Difficulties are required")
    @Column(name = "difficulties", nullable = false, columnDefinition = "TEXT")
    private String difficulties;

    @NotBlank(message = "Blockers are required")
    @Column(name = "blockers", nullable = false, columnDefinition = "TEXT")
    private String blockers;

    @NotBlank(message = "Important information is required")
    @Column(name = "important_information", nullable = false, columnDefinition = "TEXT")
    private String importantInformation;

    @NotBlank(message = "Priorities are required")
    @Column(name = "priorities", nullable = false, columnDefinition = "TEXT")
    private String priorities;

    @NotNull(message = "Time spent is required")
    @Column(name = "time_spent_minutes", nullable = false)
    private Long timeSpentMinutes;

    @NotNull(message = "Need help is required")
    @Column(name = "need_help", nullable = false)
    private Boolean needHelp;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    // =========================================================================
    // Shift metadata
    // =========================================================================

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "shift", nullable = false, length = 20)
    private Shift shift;

    /**
     * Date/time of handover.
     */
    @NotNull
    @Column(name = "passed_at", nullable = false)
    private LocalDateTime passedAt;

    // =========================================================================
    // Future-proofing: AI, PDF export, analytics, history, validation
    // =========================================================================

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "ai_processed", nullable = false)
    private Boolean aiProcessed = false;

    @Column(name = "pdf_export_available", nullable = false)
    private Boolean pdfExportAvailable = false;

    @Column(name = "rag_embeddings_available", nullable = false)
    private Boolean ragEmbeddingsAvailable = false;

    @Column(name = "search_index_version")
    private Integer searchIndexVersion;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @Column(name = "favorite_count", nullable = false)
    private Long favoriteCount = 0L;

    @Enumerated(EnumType.STRING)
    @Column(name = "manager_validation_status", nullable = false, length = 30)
    private ManagerValidationStatus managerValidationStatus = ManagerValidationStatus.PENDING;

    @Column(name = "manager_validated_at")
    private LocalDateTime managerValidatedAt;

    @Column(name = "manager_validated_by")
    private UUID managerValidatedBy;

    // =========================================================================
    // Soft delete
    // =========================================================================

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private HandoverEntryStatus status = HandoverEntryStatus.ACTIVE;

    @PrePersist
    @PreUpdate
    private void validateHierarchy() {
        if (status == null) {
            status = HandoverEntryStatus.ACTIVE;
        }
        if (timeSpentMinutes == null) {
            timeSpentMinutes = 0L;
        }
        if (needHelp == null) {
            needHelp = false;
        }
        if (aiProcessed == null) {
            aiProcessed = false;
        }
        if (pdfExportAvailable == null) {
            pdfExportAvailable = false;
        }
        if (ragEmbeddingsAvailable == null) {
            ragEmbeddingsAvailable = false;
        }
        if (viewCount == null) {
            viewCount = 0L;
        }
        if (favoriteCount == null) {
            favoriteCount = 0L;
        }
        if (managerValidationStatus == null) {
            managerValidationStatus = ManagerValidationStatus.PENDING;
        }
        if (searchIndexVersion == null) {
            searchIndexVersion = 0;
        }

        Objects.requireNonNull(workspace, "workspace must not be null");
        Objects.requireNonNull(department, "department must not be null");
        Objects.requireNonNull(project, "project must not be null");
        if (!Objects.equals(department.getId(), project.getDepartment().getId())) {
            throw new IllegalStateException("HandoverEntry.department must match project.department");
        }
        if (!Objects.equals(workspace.getId(), project.getDepartment().getWorkspace().getId())) {
            throw new IllegalStateException("HandoverEntry.workspace must match project.department.workspace");
        }
    }

    public enum HandoverEntryStatus {
        ACTIVE,
        ARCHIVED,
        DELETED
    }

    public enum Shift {
        MORNING,
        EVENING
    }

    public enum ManagerValidationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}

