package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.hr.CandidateResponse;
import com.trio.backend.dto.hr.CandidateStatusHistoryResponse;
import com.trio.backend.entity.Candidate;
import com.trio.backend.entity.CandidateStatusHistory;
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
public interface CandidateMapper {

    @Mapping(target = "departmentId", source = "candidate.department.id")
    CandidateResponse toResponse(Candidate candidate);

    CandidateStatusHistoryResponse toResponse(CandidateStatusHistory history);
}
