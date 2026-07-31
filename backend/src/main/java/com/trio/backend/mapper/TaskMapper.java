package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.task.CreateTaskRequest;
import com.trio.backend.dto.organisation.task.TaskResponse;
import com.trio.backend.dto.organisation.task.UpdateTaskRequest;
import com.trio.backend.entity.Task;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface TaskMapper {

    @Mapping(target = "projectId", source = "task.project.id")
    @Mapping(target = "assigneeId", source = "task.assignee.id")
    @Mapping(target = "assigneeName", expression = "java(task.getAssignee() != null ? task.getAssignee().getFirstName() + \" \" + task.getAssignee().getLastName() : null)")
    @Mapping(target = "sprintId", source = "task.sprint.id")
    @Mapping(target = "securityAuditId", source = "task.securityAudit.id")
    @Mapping(target = "marketingCampaignId", source = "task.marketingCampaign.id")
    @Mapping(target = "projectName", expression = "java(task.getProject().getName())")
    @Mapping(target = "departmentName", expression = "java(task.getProject().getDepartment().getName())")
    TaskResponse toResponse(Task task);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "sprint", ignore = true)
    @Mapping(target = "securityAudit", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Task toEntity(CreateTaskRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "sprint", ignore = true)
    @Mapping(target = "securityAudit", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateTask(UpdateTaskRequest request, @MappingTarget Task task);
}
