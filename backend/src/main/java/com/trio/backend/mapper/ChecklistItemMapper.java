package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.checklist.ChecklistItemResponse;
import com.trio.backend.dto.organisation.checklist.CreateChecklistItemRequest;
import com.trio.backend.dto.organisation.checklist.UpdateChecklistItemRequest;
import com.trio.backend.entity.ChecklistItem;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class
)
public interface ChecklistItemMapper {

    @Mapping(target = "checklistId", source = "item.checklist.id")
    ChecklistItemResponse toResponse(ChecklistItem item);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "checklist", ignore = true)
    @Mapping(target = "completed", ignore = true)
    @Mapping(target = "sortOrder", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    ChecklistItem toEntity(CreateChecklistItemRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "checklist", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateChecklistItem(UpdateChecklistItemRequest request, @MappingTarget ChecklistItem item);
}
