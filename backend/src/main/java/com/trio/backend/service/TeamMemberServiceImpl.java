package com.trio.backend.service;

import com.trio.backend.dto.organisation.teamMember.AddTeamMemberRequest;
import com.trio.backend.dto.organisation.teamMember.TeamMemberResponse;
import com.trio.backend.dto.organisation.teamMember.UpdateTeamMemberRequest;
import com.trio.backend.entity.Team;
import com.trio.backend.entity.TeamMember;
import com.trio.backend.entity.User;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.entity.Department;
import com.trio.backend.entity.ids.TeamMemberId;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.TeamMemberMapper;
import com.trio.backend.repository.TeamMemberRepository;
import com.trio.backend.repository.TeamRepository;
import com.trio.backend.repository.UserRepository;
import com.trio.backend.repository.WorkspaceMemberRepository;
import com.trio.backend.repository.WorkspaceRepository;
import com.trio.backend.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Implementation of the service management des TeamMember.
 *
 * <p>TeamMember associe un {@link Team} et un {@link User}.
 * Le User est toudays rerelated au Workspace via {@link WorkspaceMember}.
 * </p>
 *
 * <p><strong>RÃƒÂ¨gles mÃƒÂ©tier validatedes :</strong></p>
 * <ul>
 *   <li>Creation/modification/deletion : OWNER/ADMIN (ou SUPER_ADMIN) + TeamMember LEADER si implÃƒÂ©mentÃƒÂ©.</li>
 *   <li>Conditions : WorkspaceMember.ACTIVE + Team active + same workspace.</li>
 *   <li>Deletion : soft delete uniquement (passe en LEFT ou INACTIVE ; pour MVP : sames statuss que WorkspaceMember).</li>
 *   <li>UnicitÃƒÂ© : UNIQUE(team_id, workspace_member_id) (ici : UNIQUE(team_id, user_id) via le template).</li>
 *   <li>Invariants : absence de relations cross-workspace (bornage via workspaceId).</li>
 * </ul>
 *
 * @see TeamMemberService
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final TeamMemberMapper teamMemberMapper;

    @Override
    public TeamMemberResponse addMember(UUID workspaceId, UUID teamId, AddTeamMemberRequest request) {

        UUID actorId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, actorId);
        assertWorkspaceAdminOrOwner(workspaceId, actorId);

        Team team = teamRepository.findByIdAndWorkspace_Id(teamId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found."));

        if (team.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Team not found.");
        }

        // Le user ÃƒÂ  ajouter must be member ACTIVE of the workspace
        WorkspaceMember wm = workspaceMemberRepository
                .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspaceId, request.getUserId())
                .orElseThrow(() -> new ForbiddenException("User must be a member of this workspace."));

        if (wm.getStatus() != WorkspaceMemberStatus.ACTIVE) {
            throw new ForbiddenException("User must have ACTIVE status in this workspace.");
        }

        if (teamMemberRepository.existsByTeamMemberId_TeamIdAndTeamMemberId_UserId(teamId, request.getUserId())) {
            throw new ConflictException("User is already a member of this team.");
        }

        // Map entity
        TeamMember member = teamMemberMapper.toEntity(request);
        member.setTeam(team);

        // Invariants : user belong bien to the workspace via wm, mais l'entity TeamMember.user doit correspondssre.
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        member.setUser(user);

        member.setStatus(WorkspaceMemberStatus.ACTIVE);

        TeamMember saved = teamMemberRepository.save(member);
        return teamMemberMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TeamMemberResponse getById(UUID workspaceId, UUID teamId, UUID teamMemberUserId) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        TeamMember member = teamMemberRepository
                .findByTeamMemberId_TeamIdAndTeamMemberId_UserId(teamId, teamMemberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Team member not found."));

        // Bornage workspace : team -> department -> workspace
        if (!member.getTeam().getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Team member not found.");
        }

        return teamMemberMapper.toResponse(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamMemberResponse> listByTeam(UUID workspaceId, UUID teamId) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        // Bornage workspace via team
        Team team = teamRepository.findByIdAndWorkspace_Id(teamId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found."));

        return teamMemberRepository.findAllByTeam_Id(team.getId())
                .stream()
                .filter(tm -> tm.getStatus() == WorkspaceMemberStatus.ACTIVE)
                .map(teamMemberMapper::toResponse)
                .toList();
    }

    @Override
    public TeamMemberResponse update(UUID workspaceId, UUID teamId, UUID teamMemberUserId, UpdateTeamMemberRequest request) {

        UUID actorId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, actorId);
        assertWorkspaceAdminOrOwner(workspaceId, actorId);

        Team team = teamRepository.findByIdAndWorkspace_Id(teamId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found."));

        TeamMember member = teamMemberRepository
                .findByTeamMemberId_TeamIdAndTeamMemberId_UserId(teamId, teamMemberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Team member not found."));

        if (member.getStatus() != WorkspaceMemberStatus.ACTIVE) {
            throw new ResourceNotFoundException("Team member not found.");
        }

        // MVP : UpdateTeamMemberRequest ne contains pas encore de fields mÃƒÂ©tiers.
        teamMemberMapper.updateTeamMember(request, member);
        TeamMember saved = teamMemberRepository.save(member);

        return teamMemberMapper.toResponse(saved);
    }

    @Override
    public void remove(UUID workspaceId, UUID teamId, UUID teamMemberUserId) {

        UUID actorId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, actorId);
        assertWorkspaceAdminOrOwner(workspaceId, actorId);

        TeamMember member = teamMemberRepository
                .findByTeamMemberId_TeamIdAndTeamMemberId_UserId(teamId, teamMemberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Team member not found."));

        if (member.getStatus() != WorkspaceMemberStatus.ACTIVE) {
            return; // idempotent
        }

        // MVP soft delete : LEFT
        member.setStatus(WorkspaceMemberStatus.LEFT);
        teamMemberRepository.save(member);
    }

    // ============================================================================
    // Helpers
    // ============================================================================

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails main)) {
            throw new BadRequestException("User is not authenticated.");
        }
        return main.getId();
    }

    private void assertActiveWorkspaceMember(UUID workspaceId, UUID userId) {
        WorkspaceMember wm = workspaceMemberRepository
                .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace."));

        if (wm.getStatus() != WorkspaceMemberStatus.ACTIVE) {
            throw new ForbiddenException("You are not an active member of this workspace.");
        }
    }

    private void assertWorkspaceAdminOrOwner(UUID workspaceId, UUID userId) {
        boolean isAdmin = workspaceMemberRepository.existsWithRole(workspaceId, userId, WorkspaceRole.ADMIN);
        boolean isOwner = workspaceRepository.findById(workspaceId)
                .map(ws -> ws.getOwner().getId().equals(userId))
                .orElse(false);

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You do not have permission for this operation.");
        }
    }
}

