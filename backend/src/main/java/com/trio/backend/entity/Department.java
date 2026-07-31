package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.WorkspaceStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;

/**
 * Department is an organizational unit within a Workspace.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>User has a {@code primaryDepartment} reference for authorization isolation.
 *         Regular members can only access their primary department's data.</li>
 *     <li>Department belongs to a Workspace and is tenant-isolated via workspaceId.</li>
 * </ul>
 */
@Entity
@Table(
        name = "departments",
        indexes = {
                @Index(name = "idx_departments_workspace_id", columnList = "workspace_id"),
                @Index(name = "idx_departments_workspace_status", columnList = "workspace_id, status"),
                @Index(name = "idx_departments_workspace_name", columnList = "workspace_id, name")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_departments_workspace_id_name",
                        columnNames = {"workspace_id", "name"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private WorkspaceStatus status;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = WorkspaceStatus.ACTIVE;
        }
    }
}

