package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.organisation.teamMember.AddTeamMemberRequest;
import com.trio.backend.dto.organisation.teamMember.TeamMemberResponse;
import com.trio.backend.dto.organisation.teamMember.UpdateTeamMemberRequest;
import com.trio.backend.service.TeamMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller responsible for managing TeamMember.
 */
@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/teams/{teamId}/members")
@RequiredArgsConstructor
@Tag(name = "TeamMembers", description = "Endpoints for managing TeamMembers (organization)")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TEAM_MEMBER_ADD')")
    @Operation(
            summary = "Addsr un member ÃƒÂ  une team",
            security = @SecurityRequirement(name = "bearer"),
            description = "Adds un member (User) ÃƒÂ  une Team." 
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Member added", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Team/Workspace not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict (dÃƒÂ©jÃƒÂ  member)")
    })
    public ApiResponse<TeamMemberResponse> addMember(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID teamId,
            @Valid @RequestBody AddTeamMemberRequest request
    ) {
        return ApiResponse.success(
                "Team member added successfully.",
                teamMemberService.addMember(workspaceId, teamId, request)
        );
    }

    @GetMapping("/{userId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TEAM_MEMBER_READ')")
    @Operation(
            summary = "Resorteve a member de team",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns un TeamMember par userId." 
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Member found", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Member not found")
    })
    public ApiResponse<TeamMemberResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID teamId,
            @PathVariable("userId") UUID teamMemberUserId
    ) {
        return ApiResponse.success(
                "Team member resorteved successfully.",
                teamMemberService.getById(workspaceId, teamId, teamMemberUserId)
        );
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TEAM_MEMBER_READ')")
    @Operation(
            summary = "List members of a team",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the list of members actives of a Team." 
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List resorteved", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission")
    })
    public ApiResponse<List<TeamMemberResponse>> listByTeam(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID teamId
    ) {
        return ApiResponse.success(
                "Team members resorteved successfully.",
                teamMemberService.listByTeam(workspaceId, teamId)
        );
    }

    @PutMapping("/{userId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TEAM_MEMBER_UPDATE')")
    @Operation(
            summary = "Update a member de team",
            security = @SecurityRequirement(name = "bearer"),
            description = "Updates a TeamMember (partial update)." 
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Member updated", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Member not found")
    })
    public ApiResponse<TeamMemberResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID teamId,
            @PathVariable("userId") UUID teamMemberUserId,
            @Valid @RequestBody UpdateTeamMemberRequest request
    ) {
        return ApiResponse.success(
                "Team member updated successfully.",
                teamMemberService.update(workspaceId, teamId, teamMemberUserId, request)
        );
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canDeleteWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TEAM_MEMBER_REMOVE')")
    @Operation(
            summary = "Delete a member de team (soft delete)",
            security = @SecurityRequirement(name = "bearer"),
            description = "Supprime (soft delete) un TeamMember." 
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Member deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Member not found")
    })
    public void remove(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID teamId,
            @PathVariable("userId") UUID teamMemberUserId
    ) {
        teamMemberService.remove(workspaceId, teamId, teamMemberUserId);
    }
}
