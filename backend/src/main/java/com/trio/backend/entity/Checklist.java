package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(
        name = "checklists",
        indexes = {
                @Index(name = "idx_checklists_task_id", columnList = "task_id"),
                @Index(name = "idx_checklists_task_status", columnList = "task_id, status"),
                @Index(name = "idx_checklists_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Checklist extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @NotBlank
    @Size(max = 255)
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank
    @Size(max = 20)
    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
