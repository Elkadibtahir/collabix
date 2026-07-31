package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.TaskPriority;
import com.trio.backend.enums.TaskStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "tasks",
        indexes = {
                @Index(name = "idx_tasks_project_id", columnList = "project_id"),
                @Index(name = "idx_tasks_project_status", columnList = "project_id, status"),
                @Index(name = "idx_tasks_project_title", columnList = "project_id, title"),
                @Index(name = "idx_tasks_assignee_id", columnList = "assignee_id"),
                @Index(name = "idx_tasks_priority", columnList = "priority"),
                @Index(name = "idx_tasks_due_at", columnList = "due_at"),
                @Index(name = "idx_tasks_assignee_status", columnList = "assignee_id, status"),
                @Index(name = "idx_tasks_priority_status", columnList = "priority, status"),
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_tasks_project_id_title",
                        columnNames = {"project_id", "title"}
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @NotBlank
    @Size(max = 150)
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Size(max = 1000)
    @Column(name = "description", length = 1000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private TaskPriority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(name = "due_at")
    private Instant dueAt;

    @Column(name = "start_date")
    private Instant startDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "security_audit_id")
    private SecurityAudit securityAudit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marketing_campaign_id")
    private MarketingCampaign marketingCampaign;

    @Column(name = "story_points")
    private Integer storyPoints;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = TaskStatus.TODO;
        }
    }
}
