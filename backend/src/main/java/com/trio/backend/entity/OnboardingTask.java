package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.OnboardingTaskStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "hr_onboarding_tasks",
        indexes = {
                @Index(name = "idx_hr_obt_onboarding_id", columnList = "onboarding_id"),
                @Index(name = "idx_hr_obt_status", columnList = "status"),
                @Index(name = "idx_hr_obt_assigned_user", columnList = "assigned_user_id"),
                @Index(name = "idx_hr_obt_due_date", columnList = "due_date")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingTask extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "onboarding_id", nullable = false)
    private Onboarding onboarding;

    @NotBlank
    @Size(max = 255)
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OnboardingTaskStatus status;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(name = "assigned_user_id")
    private UUID assignedUserId;

    @Size(max = 2000)
    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "task_order")
    private Integer taskOrder;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = OnboardingTaskStatus.PENDING;
        }
    }
}
