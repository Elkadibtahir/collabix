package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.EmploymentStatus;
import com.trio.backend.enums.ContractType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "hr_employees",
        indexes = {
                @Index(name = "idx_hr_employees_department_id", columnList = "department_id"),
                @Index(name = "idx_hr_employees_team_id", columnList = "team_id"),
                @Index(name = "idx_hr_employees_manager_id", columnList = "manager_id"),
                @Index(name = "idx_hr_employees_status", columnList = "employment_status"),
                @Index(name = "idx_hr_employees_type", columnList = "employment_type"),
                @Index(name = "idx_hr_employees_department_status", columnList = "department_id, employment_status")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_hr_employees_employee_number", columnNames = {"employee_number"}),
                @UniqueConstraint(name = "uk_hr_employees_email", columnNames = {"email"}),
                @UniqueConstraint(name = "uq_hr_employees_candidate_id", columnNames = {"candidate_id"})
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends AuditableEntity {

    @NotBlank
    @Size(max = 50)
    @Column(name = "employee_number", nullable = false, unique = true, length = 50)
    private String employeeNumber;

    @NotBlank
    @Size(max = 100)
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Size(max = 50)
    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Size(max = 100)
    @Column(name = "nationality", length = 100)
    private String nationality;

    @Size(max = 255)
    @Column(name = "emergency_contact", length = 255)
    private String emergencyContact;

    @NotBlank
    @Size(max = 150)
    @Column(name = "position", nullable = false, length = 150)
    private String position;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 50)
    private ContractType employmentType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", nullable = false, length = 50)
    private EmploymentStatus employmentStatus;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Size(max = 500)
    @Column(name = "profile_picture_path", length = 500)
    private String profilePicturePath;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;

    @PrePersist
    private void prePersist() {
        if (employmentStatus == null) {
            employmentStatus = EmploymentStatus.ONBOARDING;
        }
    }
}
