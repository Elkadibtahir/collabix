package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.handover.CreateHandoverEntryRequest;
import com.trio.backend.dto.organisation.handover.HandoverEntryResponse;
import com.trio.backend.dto.organisation.handover.UpdateHandoverEntryRequest;
import com.trio.backend.entity.HandoverEntry;
import org.mapstruct.*;

/**
 * Mapper for HandoverEntry module.
 */
@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface HandoverEntryMapper {

    @Mappings({
            @Mapping(target = "workFinished", source = "workFinished"),
            @Mapping(target = "workRemaining", source = "workRemaining"),
            @Mapping(target = "difficulties", source = "difficulties"),
            @Mapping(target = "blockers", source = "blockers"),
            @Mapping(target = "importantInformation", source = "importantInformation"),
            @Mapping(target = "priorities", source = "priorities"),
            @Mapping(target = "timeSpentMinutes", source = "timeSpentMinutes"),
            @Mapping(target = "needHelp", source = "needHelp"),
            @Mapping(target = "additionalNotes", source = "additionalNotes"),

            @Mapping(target = "shift", source = "shift"),
            @Mapping(target = "passedAt", source = "passedAt"),

            @Mapping(target = "createdAt", source = "createdAt"),
            @Mapping(target = "updatedAt", source = "updatedAt")
    })
    HandoverEntryResponse toResponse(HandoverEntry handoverEntry);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "workspace", ignore = true),
            @Mapping(target = "department", ignore = true),
            @Mapping(target = "project", ignore = true),
            @Mapping(target = "task", ignore = true),
            @Mapping(target = "user", ignore = true),
            @Mapping(target = "status", ignore = true),
            @Mapping(target = "createdAt", ignore = true),
            @Mapping(target = "updatedAt", ignore = true),
            @Mapping(target = "createdBy", ignore = true),
            @Mapping(target = "updatedBy", ignore = true)
    })
    HandoverEntry toEntity(CreateHandoverEntryRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "workspace", ignore = true),
            @Mapping(target = "department", ignore = true),
            @Mapping(target = "project", ignore = true),
            @Mapping(target = "task", ignore = true),
            @Mapping(target = "user", ignore = true),
            @Mapping(target = "status", ignore = true),
            @Mapping(target = "createdAt", ignore = true),
            @Mapping(target = "updatedAt", ignore = true),
            @Mapping(target = "createdBy", ignore = true),
            @Mapping(target = "updatedBy", ignore = true)
    })
    void updateHandoverEntry(UpdateHandoverEntryRequest request, @MappingTarget HandoverEntry handoverEntry);
}

