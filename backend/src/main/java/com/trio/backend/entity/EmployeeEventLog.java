package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(
        name = "hr_employee_event_logs",
        indexes = {
                @Index(name = "idx_hr_employee_event_logs_employee_id", columnList = "employee_id"),
                @Index(name = "idx_hr_employee_event_logs_event_type", columnList = "event_type"),
                @Index(name = "idx_hr_employee_event_logs_created_at", columnList = "employee_id, created_at DESC")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEventLog extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotBlank
    @Size(max = 50)
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Size(max = 255)
    @Column(name = "previous_value", length = 255)
    private String previousValue;

    @Size(max = 255)
    @Column(name = "new_value", length = 255)
    private String newValue;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
