package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.OnboardingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "hr_onboardings",
        indexes = {
                @Index(name = "idx_hr_ob_employee_id", columnList = "employee_id"),
                @Index(name = "idx_hr_ob_status", columnList = "status"),
                @Index(name = "idx_hr_ob_assigned_hr", columnList = "assigned_hr_id"),
                @Index(name = "idx_hr_ob_start_date", columnList = "start_date"),
                @Index(name = "idx_hr_ob_employee_status", columnList = "employee_id, status")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Onboarding extends AuditableEntity {

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OnboardingStatus status;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    @Column(name = "actual_completion_date")
    private LocalDate actualCompletionDate;

    @Column(name = "assigned_hr_id")
    private UUID assignedHrId;

    @Column(name = "assigned_manager_id")
    private UUID assignedManagerId;

    @Size(max = 2000)
    @Column(name = "notes", length = 2000)
    private String notes;

    @Builder.Default
    @OneToMany(mappedBy = "onboarding", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("taskOrder ASC")
    private List<OnboardingTask> tasks = new ArrayList<>();

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = OnboardingStatus.NOT_STARTED;
        }
    }
}
