package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.EmployeeDocumentResponse;
import com.trio.backend.entity.EmployeeDocument;
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
public interface EmployeeDocumentMapper {

    @Mapping(target = "employeeId", source = "document.employee.id")
    EmployeeDocumentResponse toResponse(EmployeeDocument document);
}
