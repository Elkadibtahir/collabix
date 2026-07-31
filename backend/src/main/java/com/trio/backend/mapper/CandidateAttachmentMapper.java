package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.CandidateAttachmentResponse;
import com.trio.backend.entity.CandidateAttachment;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface CandidateAttachmentMapper {

    @Mapping(target = "candidateId", source = "attachment.candidate.id")
    CandidateAttachmentResponse toResponse(CandidateAttachment attachment);
}
