package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.SprintStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "dev_sprints",
        indexes = {
                @Index(name = "idx_dev_sprint_department_id", columnList = "department_id"),
                @Index(name = "idx_dev_sprint_project_id", columnList = "project_id"),
                @Index(name = "idx_dev_sprint_team_id", columnList = "team_id"),
                @Index(name = "idx_dev_sprint_status", columnList = "status"),
                @Index(name = "idx_dev_sprint_dates", columnList = "start_date, end_date"),
                @Index(name = "idx_dev_sprint_project_status", columnList = "project_id, status")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sprint extends AuditableEntity {

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

    @Size(max = 500)
    @Column(name = "goal", length = 500)
    private String goal;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SprintStatus status;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "velocity")
    private Double velocity;

    @Column(name = "completed_story_points")
    private Integer completedStoryPoints;

    @Column(name = "total_story_points")
    private Integer totalStoryPoints;

    @Column(name = "total_tasks")
    private Integer totalTasks;

    @Column(name = "completed_tasks")
    private Integer completedTasks;

    @Column(name = "completion_percentage")
    private Double completionPercentage;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = SprintStatus.PLANNED;
        }
    }
}
