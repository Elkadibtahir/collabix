package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.AuditPriority;
import com.trio.backend.enums.AuditStatus;
import com.trio.backend.enums.AuditType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "security_audits",
        indexes = {
                @Index(name = "idx_audit_department_id", columnList = "department_id"),
                @Index(name = "idx_audit_project_id", columnList = "project_id"),
                @Index(name = "idx_audit_team_id", columnList = "team_id"),
                @Index(name = "idx_audit_status", columnList = "status"),
                @Index(name = "idx_audit_type", columnList = "audit_type"),
                @Index(name = "idx_audit_priority", columnList = "priority"),
                @Index(name = "idx_audit_dates", columnList = "start_date, end_date"),
                @Index(name = "idx_audit_project_status", columnList = "project_id, status")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityAudit extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "audit_type", nullable = false, length = 30)
    private AuditType auditType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AuditStatus status;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 10)
    private AuditPriority priority;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @Column(name = "total_tasks")
    private Integer totalTasks;

    @Column(name = "completed_tasks")
    private Integer completedTasks;

    @Column(name = "completion_percentage")
    private Double completionPercentage;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = AuditStatus.PLANNED;
        }
        if (priority == null) {
            priority = AuditPriority.MEDIUM;
        }
    }
}
