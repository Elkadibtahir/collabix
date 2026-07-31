package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.SkillCategory;
import com.trio.backend.enums.SkillLevel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "hr_employee_skills",
        indexes = {
                @Index(name = "idx_hr_es_employee_id", columnList = "employee_id"),
                @Index(name = "idx_hr_es_category", columnList = "category"),
                @Index(name = "idx_hr_es_level", columnList = "proficiency_level"),
                @Index(name = "idx_hr_es_verified", columnList = "verified"),
                @Index(name = "idx_hr_es_active", columnList = "active"),
                @Index(name = "idx_hr_es_employee_category", columnList = "employee_id, category"),
                @Index(name = "idx_hr_es_cert_expiration", columnList = "certification_expiration")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_hr_es_employee_skill",
                        columnNames = {"employee_id", "skill_name"}
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSkill extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotBlank
    @Size(max = 150)
    @Column(name = "skill_name", nullable = false, length = 150)
    private String skillName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private SkillCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", nullable = false, length = 20)
    private SkillLevel proficiencyLevel;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "last_used_date")
    private LocalDate lastUsedDate;

    @Size(max = 255)
    @Column(name = "certification_name", length = 255)
    private String certificationName;

    @Size(max = 255)
    @Column(name = "certification_issuer", length = 255)
    private String certificationIssuer;

    @Column(name = "certification_date")
    private LocalDate certificationDate;

    @Column(name = "certification_expiration")
    private LocalDate certificationExpiration;

    @Column(name = "verified", nullable = false)
    private boolean verified;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Size(max = 1000)
    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "active", nullable = false)
    private boolean active;

    @PrePersist
    private void prePersist() {
        if (!active) {
            active = true;
        }
    }
}
