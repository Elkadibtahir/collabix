package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.EmployeeResponse;
import com.trio.backend.dto.hr.EmployeeTimelineEntry;
import com.trio.backend.entity.Employee;
import com.trio.backend.entity.EmployeeEventLog;
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
public interface EmployeeMapper {

    @Mapping(target = "departmentId", source = "employee.department.id")
    @Mapping(target = "teamId", source = "employee.team.id")
    @Mapping(target = "managerId", source = "employee.manager.id")
    @Mapping(target = "candidateId", source = "employee.candidate.id")
    EmployeeResponse toResponse(Employee employee);

    @Mapping(target = "id", source = "log.id")
    @Mapping(target = "eventType", source = "log.eventType")
    @Mapping(target = "title", expression = "java(log.getEventType().replace('_', ' '))")
    @Mapping(target = "description", source = "log.description")
    @Mapping(target = "occurredAt", source = "log.createdAt")
    @Mapping(target = "actorId", source = "log.createdBy")
    EmployeeTimelineEntry toTimelineEntry(EmployeeEventLog log);
}
