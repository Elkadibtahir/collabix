package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.checklist.ChecklistResponse;
import com.trio.backend.dto.organisation.checklist.CreateChecklistRequest;
import com.trio.backend.dto.organisation.checklist.UpdateChecklistRequest;
import com.trio.backend.entity.Checklist;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class
)
public interface ChecklistMapper {

    @Mapping(target = "taskId", source = "checklist.task.id")
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "totalItems", ignore = true)
    @Mapping(target = "completedItems", ignore = true)
    @Mapping(target = "completionPercentage", ignore = true)
    ChecklistResponse toResponse(Checklist checklist);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Checklist toEntity(CreateChecklistRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateChecklist(UpdateChecklistRequest request, @MappingTarget Checklist checklist);
}
