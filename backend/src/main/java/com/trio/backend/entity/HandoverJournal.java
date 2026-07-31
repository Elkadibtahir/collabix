package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * HandoverJournal represents the automatically generated result built from multiple HandoverEntry records.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>HandoverJournal belongs to exactly one Workspace, one Department and one Project.</li>
 *     <li>No business logic is implemented here: it is a data container for future features.</li>
 *     <li>Soft-delete is handled via status.</li>
 * </ul>
 */
@Entity
@Table(
        name = "handover_journals",
        indexes = {
                @Index(name = "idx_handover_journals_workspace_id", columnList = "workspace_id"),
                @Index(name = "idx_handover_journals_department_id", columnList = "department_id"),
                @Index(name = "idx_handover_journals_project_id", columnList = "project_id"),
                @Index(name = "idx_handover_journals_shift", columnList = "shift"),
                @Index(name = "idx_handover_journals_date", columnList = "journal_date"),
                @Index(name = "idx_handover_journals_status", columnList = "status"),
                @Index(name = "idx_handover_journals_created_at", columnList = "created_at")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_handover_journals_project_shift_date",
                        columnNames = {"project_id", "shift", "journal_date"}
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverJournal extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false, updatable = false)
    private Workspace workspace;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false, updatable = false)
    private Department department;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false, updatable = false)
    private Project project;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "shift", nullable = false, length = 20)
    private Shift shift;

    @NotNull
    @Column(name = "journal_date", nullable = false)
    private LocalDateTime journalDate;

    // =========================================================================
    // Generated fields
    // =========================================================================

    @NotBlank(message = "Generated summary is required")
    @Column(name = "generated_summary", nullable = false, columnDefinition = "TEXT")
    private String generatedSummary;

    @NotBlank(message = "Main done work is required")
    @Column(name = "main_done_work", nullable = false, columnDefinition = "TEXT")
    private String mainDoneWork;

    @NotBlank(message = "Main remaining work is required")
    @Column(name = "main_remaining_work", nullable = false, columnDefinition = "TEXT")
    private String mainRemainingWork;

    @NotBlank(message = "Blockers are required")
    @Column(name = "blockers", nullable = false, columnDefinition = "TEXT")
    private String blockers;

    @NotBlank(message = "Difficulties are required")
    @Column(name = "difficulties", nullable = false, columnDefinition = "TEXT")
    private String difficulties;

    @NotBlank(message = "Recommendations are required")
    @Column(name = "recommendations", nullable = false, columnDefinition = "TEXT")
    private String recommendations;

    // =========================================================================
    // Generation status
    // =========================================================================

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "generation_status", nullable = false, length = 30)
    private GenerationStatus generationStatus = GenerationStatus.PENDING;

    @Column(name = "generation_date")
    private LocalDateTime generationDate;

    @Column(name = "generation_processed_by")
    private UUID generationProcessedBy;

    // =========================================================================
    // Soft delete
    // =========================================================================

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private HandoverJournalStatus status = HandoverJournalStatus.ACTIVE;

    // =========================================================================
    // Future-proofing: validation manager, history, versioning, export PDF, analytics,
    // IA, search. Those fields are intentionally not implemented yet.
    // =========================================================================

    @PrePersist
    @PreUpdate
    private void validateHierarchy() {
        if (generationStatus == null) {
            generationStatus = GenerationStatus.PENDING;
        }
        if (status == null) {
            status = HandoverJournalStatus.ACTIVE;
        }

        Objects.requireNonNull(workspace, "workspace must not be null");
        Objects.requireNonNull(department, "department must not be null");
        Objects.requireNonNull(project, "project must not be null");
        if (!Objects.equals(department.getId(), project.getDepartment().getId())) {
            throw new IllegalStateException("HandoverJournal.department must match project.department");
        }
        if (!Objects.equals(workspace.getId(), project.getDepartment().getWorkspace().getId())) {
            throw new IllegalStateException("HandoverJournal.workspace must match project.department.workspace");
        }
    }

    public enum Shift {
        MORNING,
        EVENING
    }

    public enum GenerationStatus {
        PENDING,
        GENERATED,
        FAILED
    }

    public enum HandoverJournalStatus {
        ACTIVE,
        ARCHIVED,
        DELETED
    }
}

