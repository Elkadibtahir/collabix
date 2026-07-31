package com.trio.backend.service;

import com.trio.backend.dto.organisation.teamMember.AddTeamMemberRequest;
import com.trio.backend.dto.organisation.teamMember.TeamMemberResponse;
import com.trio.backend.dto.organisation.teamMember.UpdateTeamMemberRequest;

import java.util.List;
import java.util.UUID;

public interface TeamMemberService {

    TeamMemberResponse addMember(UUID workspaceId, UUID teamId, AddTeamMemberRequest request);

    TeamMemberResponse getById(UUID workspaceId, UUID teamId, UUID teamMemberUserId);

    List<TeamMemberResponse> listByTeam(UUID workspaceId, UUID teamId);

    TeamMemberResponse update(UUID workspaceId, UUID teamId, UUID teamMemberUserId, UpdateTeamMemberRequest request);

    void remove(UUID workspaceId, UUID teamId, UUID teamMemberUserId);
}

