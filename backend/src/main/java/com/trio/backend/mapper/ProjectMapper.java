package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.project.CreateProjectRequest;
import com.trio.backend.dto.organisation.project.ProjectResponse;
import com.trio.backend.dto.organisation.project.UpdateProjectRequest;
import com.trio.backend.entity.Project;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class
)
public interface ProjectMapper {

    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "workspaceId", source = "department.workspace.id")
    @Mapping(target = "managerId", source = "manager.id")
    @Mapping(target = "managerName", expression = "java(project.getManager() != null ? project.getManager().getFirstName() + \" \" + project.getManager().getLastName() : null)")
    @Mapping(target = "departmentName", source = "department.name")
    ProjectResponse toResponse(Project project);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Project toEntity(CreateProjectRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateProject(UpdateProjectRequest request, @MappingTarget Project project);
}
