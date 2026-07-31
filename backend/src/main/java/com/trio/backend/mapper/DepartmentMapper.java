package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.department.CreateDepartmentRequest;
import com.trio.backend.dto.organisation.department.DepartmentDetailsResponse;
import com.trio.backend.dto.organisation.department.DepartmentResponse;
import com.trio.backend.dto.organisation.department.DepartmentSummaryResponse;
import com.trio.backend.dto.organisation.department.UpdateDepartmentRequest;
import com.trio.backend.entity.Department;

import org.mapstruct.*;

import java.util.Set;
import java.util.UUID;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface DepartmentMapper {

    DepartmentResponse toResponse(Department department);

    DepartmentSummaryResponse toSummary(Department department);

    DepartmentDetailsResponse toDetails(Department department);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Department toEntity(CreateDepartmentRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateDepartment(UpdateDepartmentRequest request, @MappingTarget Department department);
}

