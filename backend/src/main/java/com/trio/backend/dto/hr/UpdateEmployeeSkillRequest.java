package com.trio.backend.dto.hr;

import com.trio.backend.enums.SkillCategory;
import com.trio.backend.enums.SkillLevel;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateEmployeeSkillRequest {

    @Size(max = 150)
    private String skillName;

    private SkillCategory category;

    private SkillLevel proficiencyLevel;

    private Integer yearsOfExperience;

    private LocalDate lastUsedDate;

    @Size(max = 255)
    private String certificationName;

    @Size(max = 255)
    private String certificationIssuer;

    private LocalDate certificationDate;

    private LocalDate certificationExpiration;

    @Size(max = 1000)
    private String notes;

    private Boolean active;
}
