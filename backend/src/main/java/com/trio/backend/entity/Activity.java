package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.ActivityStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(
        name = "activities",
        indexes = {
                @Index(name = "idx_activities_task_id", columnList = "task_id"),
                @Index(name = "idx_activities_actor_id", columnList = "actor_id"),
                @Index(name = "idx_activities_task_status", columnList = "task_id, status"),
                @Index(name = "idx_activities_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Activity extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @NotBlank
    @Size(max = 2000)
    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ActivityStatus status = ActivityStatus.ACTIVE;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = ActivityStatus.ACTIVE;
        }
    }
}
