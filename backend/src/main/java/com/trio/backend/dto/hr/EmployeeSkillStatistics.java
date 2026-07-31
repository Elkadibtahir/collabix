package com.trio.backend.dto.hr;

import com.trio.backend.enums.SkillCategory;
import com.trio.backend.enums.SkillLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class EmployeeSkillStatistics {

    private long totalSkills;
    private long verifiedCount;
    private long unverifiedCount;
    private long certificationCount;
    private long expiringCertificationCount;
    private double averageSkillsPerEmployee;
    private Map<SkillCategory, Long> skillsByCategory;
    private Map<SkillLevel, Long> skillsByLevel;
    private List<SkillSummary> topSkills;
}
