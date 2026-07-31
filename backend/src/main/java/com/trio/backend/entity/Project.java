package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.ProjectPriority;
import com.trio.backend.enums.WorkspaceStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "projects",
        indexes = {
                @Index(name = "idx_projects_department_id", columnList = "department_id"),
                @Index(name = "idx_projects_department_status", columnList = "department_id, status"),
                @Index(name = "idx_projects_department_name", columnList = "department_id, name"),
                @Index(name = "idx_projects_manager_id", columnList = "manager_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_projects_department_id_name",
                        columnNames = {"department_id", "name"}
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private WorkspaceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private ProjectPriority priority;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @Column(name = "color", length = 7)
    private String color;

    @Column(name = "icon", length = 50)
    private String icon;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = WorkspaceStatus.ACTIVE;
        }
    }
}
