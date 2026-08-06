package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.handover.HandoverTimelineEventResponse;
import com.trio.backend.entity.HandoverTimelineEvent;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper for the HandoverTimelineEvent module.
 */
@Mapper(config = MapStructConfig.class, builder = @Builder(disableBuilder = true))
public interface HandoverTimelineEventMapper {

    @Mapping(source = "handoverEntry.id", target = "handoverEntryId")
    HandoverTimelineEventResponse toResponse(HandoverTimelineEvent event);
}
