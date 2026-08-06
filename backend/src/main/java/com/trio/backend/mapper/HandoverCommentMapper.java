package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.handover.HandoverCommentResponse;
import com.trio.backend.entity.HandoverComment;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper for the HandoverComment module.
 */
@Mapper(config = MapStructConfig.class, builder = @Builder(disableBuilder = true), uses = UserSummaryMapper.class)
public interface HandoverCommentMapper {

    @Mapping(source = "handoverEntry.id", target = "handoverEntryId")
    HandoverCommentResponse toResponse(HandoverComment comment);
}
