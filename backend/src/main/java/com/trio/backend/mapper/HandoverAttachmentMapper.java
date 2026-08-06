package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.handover.CreateHandoverAttachmentRequest;
import com.trio.backend.dto.organisation.handover.HandoverAttachmentResponse;
import com.trio.backend.entity.HandoverAttachment;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper for the HandoverAttachment module.
 */
@Mapper(config = MapStructConfig.class, builder = @Builder(disableBuilder = true), uses = UserSummaryMapper.class)
public interface HandoverAttachmentMapper {

    @Mapping(source = "handoverEntry.id", target = "handoverEntryId")
    HandoverAttachmentResponse toResponse(HandoverAttachment attachment);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "handoverEntry", ignore = true)
    @Mapping(target = "uploadedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    HandoverAttachment toEntity(CreateHandoverAttachmentRequest request);
}
