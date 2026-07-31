package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.WorkspaceStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "workspaces",
        indexes = {
                @Index(name = "idx_workspaces_status", columnList = "status")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_workspaces_owner_id_name",
                        columnNames = {"owner_id", "name"}
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workspace extends AuditableEntity {

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


    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Builder.Default
    @OneToMany(
            mappedBy = "workspace",
            fetch = FetchType.LAZY,
            cascade = {CascadeType.PERSIST, CascadeType.MERGE}
    )
    private Set<WorkspaceMember> workspaceMembers = new HashSet<>();


    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = WorkspaceStatus.ACTIVE;
        }
    }
}
