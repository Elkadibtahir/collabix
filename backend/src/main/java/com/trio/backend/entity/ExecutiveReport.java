package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(
        name = "executive_reports",
        indexes = {
                @Index(name = "idx_exec_reports_workspace_id", columnList = "workspace_id"),
                @Index(name = "idx_exec_reports_department_id", columnList = "department_id"),
                @Index(name = "idx_exec_reports_project_id", columnList = "project_id"),
                @Index(name = "idx_exec_reports_type", columnList = "report_type"),
                @Index(name = "idx_exec_reports_period_start", columnList = "period_start"),
                @Index(name = "idx_exec_reports_status", columnList = "status"),
                @Index(name = "idx_exec_reports_generation_status", columnList = "generation_status"),
                @Index(name = "idx_exec_reports_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutiveReport extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false, updatable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @NotBlank
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 30)
    private ReportType reportType;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "report_version", nullable = false)
    private Integer reportVersion = 1;

    @Column(name = "structured_analysis", columnDefinition = "TEXT")
    private String structuredAnalysis;

    @Column(name = "executive_summary", columnDefinition = "TEXT")
    private String executiveSummary;

    @Column(name = "major_highlights", columnDefinition = "TEXT")
    private String majorHighlights;

    @Column(name = "business_health", columnDefinition = "TEXT")
    private String businessHealth;

    @Column(name = "productivity_review", columnDefinition = "TEXT")
    private String productivityReview;

    @Column(name = "critical_risks", columnDefinition = "TEXT")
    private String criticalRisks;

    @Column(name = "achievements", columnDefinition = "TEXT")
    private String achievements;

    @Column(name = "challenges", columnDefinition = "TEXT")
    private String challenges;

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "strategic_priorities", columnDefinition = "TEXT")
    private String strategicPriorities;

    @Column(name = "next_actions", columnDefinition = "TEXT")
    private String nextActions;

    @Column(name = "final_report", columnDefinition = "TEXT")
    private String finalReport;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "generation_status", nullable = false, length = 30)
    private GenerationStatus generationStatus = GenerationStatus.PENDING;

    @Column(name = "generation_date")
    private LocalDateTime generationDate;

    @Column(name = "generation_processed_by")
    private UUID generationProcessedBy;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReportStatus status = ReportStatus.ACTIVE;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @PrePersist
    @PreUpdate
    private void validate() {
        if (generationStatus == null) generationStatus = GenerationStatus.PENDING;
        if (status == null) status = ReportStatus.ACTIVE;
        if (approvalStatus == null) approvalStatus = ApprovalStatus.PENDING;
        if (reportVersion == null) reportVersion = 1;
        Objects.requireNonNull(workspace, "workspace must not be null");
    }

    public enum ReportType {
        DAILY, WEEKLY, MONTHLY, DEPARTMENT, WORKSPACE, PROJECT, EXECUTIVE, CUSTOM
    }

    public enum GenerationStatus {
        PENDING, COMPLETED, FAILED
    }

    public enum ReportStatus {
        ACTIVE, ARCHIVED, DELETED
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
