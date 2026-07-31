package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.dev.SprintResponse;
import com.trio.backend.entity.Sprint;
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
public interface SprintMapper {

    @Mapping(target = "departmentId", source = "sprint.department.id")
    @Mapping(target = "projectId", source = "sprint.project.id")
    @Mapping(target = "projectName", source = "sprint.project.name")
    @Mapping(target = "teamId", expression = "java(sprint.getTeam() != null ? sprint.getTeam().getId() : null)")
    @Mapping(target = "teamName", expression = "java(sprint.getTeam() != null ? sprint.getTeam().getName() : null)")
    @Mapping(target = "remainingTasks", expression = "java(sprint.getTotalTasks() != null && sprint.getCompletedTasks() != null ? sprint.getTotalTasks() - sprint.getCompletedTasks() : 0)")
    SprintResponse toResponse(Sprint sprint);
}
