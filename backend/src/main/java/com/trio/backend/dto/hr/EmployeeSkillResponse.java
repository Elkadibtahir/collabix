package com.trio.backend.dto.hr;

import com.trio.backend.enums.SkillCategory;
import com.trio.backend.enums.SkillLevel;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class EmployeeSkillResponse {

    private UUID id;
    private UUID employeeId;
    private String skillName;
    private SkillCategory category;
    private SkillLevel proficiencyLevel;
    private Integer yearsOfExperience;
    private LocalDate lastUsedDate;
    private String certificationName;
    private String certificationIssuer;
    private LocalDate certificationDate;
    private LocalDate certificationExpiration;
    private boolean verified;
    private UUID verifiedBy;
    private Instant verifiedAt;
    private String notes;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
