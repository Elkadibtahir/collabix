package com.trio.backend.dto.hr;

import com.trio.backend.enums.SkillCategory;
import com.trio.backend.enums.SkillLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SkillSummary {

    private String skillName;
    private SkillCategory category;
    private SkillLevel level;
    private long count;
}
