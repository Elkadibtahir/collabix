package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.EmployeeSkillResponse;
import com.trio.backend.entity.EmployeeSkill;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class
)
public interface EmployeeSkillMapper {

    @Mapping(target = "employeeId", source = "skill.employee.id")
    EmployeeSkillResponse toResponse(EmployeeSkill skill);
}
