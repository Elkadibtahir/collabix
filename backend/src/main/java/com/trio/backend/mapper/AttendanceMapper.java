package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.AttendanceResponse;
import com.trio.backend.entity.Attendance;
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
public interface AttendanceMapper {

    @Mapping(target = "employeeId", source = "attendance.employee.id")
    @Mapping(target = "employeeName", expression = "java(attendance.getEmployee().getFirstName() + \" \" + attendance.getEmployee().getLastName())")
    @Mapping(target = "employeeNumber", source = "attendance.employee.employeeNumber")
    AttendanceResponse toResponse(Attendance attendance);
}
