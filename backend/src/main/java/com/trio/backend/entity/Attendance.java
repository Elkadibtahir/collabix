package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.AttendanceStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "hr_attendances",
        indexes = {
                @Index(name = "idx_hr_att_employee_id", columnList = "employee_id"),
                @Index(name = "idx_hr_att_date", columnList = "attendance_date"),
                @Index(name = "idx_hr_att_status", columnList = "status"),
                @Index(name = "idx_hr_att_employee_date", columnList = "employee_id, attendance_date"),
                @Index(name = "idx_hr_att_employee_status", columnList = "employee_id, status"),
                @Index(name = "idx_hr_att_month", columnList = "employee_id, attendance_date, status")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_hr_att_employee_date",
                        columnNames = {"employee_id", "attendance_date"}
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull
    @Column(name = "attendance_date", nullable = false)
    private LocalDate date;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "worked_hours")
    private Double workedHours;

    @Column(name = "break_duration")
    private Integer breakDuration;

    @Column(name = "overtime_hours")
    private Double overtimeHours;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AttendanceStatus status;

    @Size(max = 1000)
    @Column(name = "notes", length = 1000)
    private String notes;
}
