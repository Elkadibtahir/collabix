package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.cyber.SecurityAuditResponse;
import com.trio.backend.entity.SecurityAudit;
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
public interface SecurityAuditMapper {

    @Mapping(target = "departmentId", source = "audit.department.id")
    @Mapping(target = "projectId", source = "audit.project.id")
    @Mapping(target = "projectName", source = "audit.project.name")
    @Mapping(target = "teamId", expression = "java(audit.getTeam() != null ? audit.getTeam().getId() : null)")
    @Mapping(target = "teamName", expression = "java(audit.getTeam() != null ? audit.getTeam().getName() : null)")
    @Mapping(target = "remainingTasks", expression = "java(audit.getTotalTasks() != null && audit.getCompletedTasks() != null ? audit.getTotalTasks() - audit.getCompletedTasks() : 0)")
    @Mapping(target = "createdAt", source = "audit.createdAt")
    @Mapping(target = "updatedAt", source = "audit.updatedAt")
    SecurityAuditResponse toResponse(SecurityAudit audit);
}
