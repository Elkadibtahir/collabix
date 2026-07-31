package com.trio.backend.mapper;

import com.trio.backend.config.InstantToLocalDateTimeMapper;
import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.organisation.teamMember.AddTeamMemberRequest;
import com.trio.backend.dto.organisation.teamMember.TeamMemberResponse;
import com.trio.backend.dto.organisation.teamMember.UpdateTeamMemberRequest;
import com.trio.backend.entity.TeamMember;
import com.trio.backend.entity.ids.TeamMemberId;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @Builder(disableBuilder = true),
        config = MapStructConfig.class,
        uses = InstantToLocalDateTimeMapper.class
)
public interface TeamMemberMapper {

    @Mapping(target = "teamId", source = "teamMemberId.teamId")
    @Mapping(target = "userId", source = "teamMemberId.userId")
    TeamMemberResponse toResponse(TeamMember teamMember);

    @Mapping(target = "teamMemberId", ignore = true)
    @Mapping(target = "status", ignore = true)
    TeamMember toEntity(AddTeamMemberRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "teamMemberId", ignore = true)
    @Mapping(target = "team", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateTeamMember(UpdateTeamMemberRequest request, @MappingTarget TeamMember teamMember);
}

