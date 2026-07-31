package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.activity.ActivityResponse;
import com.trio.backend.dto.organisation.activity.CreateActivityRequest;
import com.trio.backend.dto.organisation.activity.UpdateActivityRequest;
import com.trio.backend.entity.Activity;
import org.mapstruct.*;

/**
 * Mapper for Activity module.
 */

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface ActivityMapper {

    @Mapping(target = "actorName", expression = "java(activity.getActor().getFirstName() + \" \" + activity.getActor().getLastName())")
    ActivityResponse toResponse(Activity activity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(target = "actor", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Activity toEntity(CreateActivityRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(target = "actor", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateActivity(UpdateActivityRequest request, @MappingTarget Activity activity);
}

