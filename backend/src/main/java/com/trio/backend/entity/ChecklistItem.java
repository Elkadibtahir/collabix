package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(
        name = "checklist_items",
        indexes = {
                @Index(name = "idx_checklist_items_checklist_id", columnList = "checklist_id"),
                @Index(name = "idx_checklist_items_checklist_status", columnList = "checklist_id, status"),
                @Index(name = "idx_checklist_items_sort_order", columnList = "checklist_id, sort_order")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItem extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "checklist_id", nullable = false)
    private Checklist checklist;

    @NotBlank
    @Size(max = 500)
    @Column(name = "content", nullable = false, length = 500)
    private String content;

    @Column(name = "completed", nullable = false)
    private boolean completed = false;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

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
