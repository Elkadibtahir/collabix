package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.team.CreateTeamRequest;
import com.trio.backend.dto.organisation.team.TeamDetailsResponse;
import com.trio.backend.dto.organisation.team.TeamResponse;
import com.trio.backend.dto.organisation.team.TeamSummaryResponse;
import com.trio.backend.dto.organisation.team.UpdateTeamRequest;
import com.trio.backend.entity.Team;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface TeamMapper {

    TeamResponse toResponse(Team team);

    TeamSummaryResponse toSummary(Team team);

    TeamDetailsResponse toDetails(Team team);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Team toEntity(CreateTeamRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateTeam(UpdateTeamRequest request, @MappingTarget Team team);
}

