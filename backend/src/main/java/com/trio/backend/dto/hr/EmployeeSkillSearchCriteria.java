package com.trio.backend.dto.hr;

import com.trio.backend.enums.SkillCategory;
import com.trio.backend.enums.SkillLevel;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class EmployeeSkillSearchCriteria {

    private UUID employeeId;
    private SkillCategory category;
    private SkillLevel proficiencyLevel;
    private Boolean verified;
    private Boolean active;
    private Boolean hasCertification;
    private LocalDate certificationExpiringBefore;
    private String keyword;
}
