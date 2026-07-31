package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.ModelStatus;
import com.trio.backend.enums.ModelType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "ai_models",
        indexes = {
                @Index(name = "idx_ai_model_department_id", columnList = "department_id"),
                @Index(name = "idx_ai_model_project_id", columnList = "project_id"),
                @Index(name = "idx_ai_model_team_id", columnList = "team_id"),
                @Index(name = "idx_ai_model_status", columnList = "status"),
                @Index(name = "idx_ai_model_type", columnList = "model_type"),
                @Index(name = "idx_ai_model_owner", columnList = "owner_id"),
                @Index(name = "idx_ai_model_project_status", columnList = "project_id, status")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIModel extends AuditableEntity {

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
    @Column(name = "model_type", nullable = false, length = 30)
    private ModelType modelType;

    @Size(max = 50)
    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Size(max = 500)
    @Column(name = "objective", length = 500)
    private String objective;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ModelStatus status;

    @Column(name = "accuracy")
    private Double accuracy;

    @Column(name = "owner_id")
    private UUID ownerId;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = ModelStatus.PLANNING;
        }
    }
}
