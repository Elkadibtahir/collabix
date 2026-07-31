package com.trio.backend.service;

import com.trio.backend.dto.organisation.teamMember.AddTeamMemberRequest;
import com.trio.backend.entity.Team;
import com.trio.backend.entity.TeamMember;
import com.trio.backend.entity.User;
import com.trio.backend.entity.Workspace;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.entity.ids.TeamMemberId;
import com.trio.backend.entity.ids.WorkspaceMemberId;
import com.trio.backend.enums.MemberType;
import com.trio.backend.enums.UserStatus;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.mapper.TeamMemberMapper;
import com.trio.backend.repository.TeamMemberRepository;
import com.trio.backend.repository.TeamRepository;
import com.trio.backend.repository.UserRepository;
import com.trio.backend.repository.WorkspaceMemberRepository;
import com.trio.backend.repository.WorkspaceRepository;
import com.trio.backend.security.user.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamMemberServiceImplTest {

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamMemberMapper teamMemberMapper;

    @InjectMocks
    private TeamMemberServiceImpl teamMemberService;

    private User actor;
    private User targetUser;
    private Workspace workspace;
    private Team team;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        UUID actorId = UUID.randomUUID();
        UUID targetUserId = UUID.randomUUID();
        UUID workspaceId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        actor = User.builder()
                .email("admin@example.com")
                .password("secret")
                .firstName("Ada")
                .lastName("Lovelace")
                .memberType(MemberType.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(actor, "id", actorId);

        targetUser = User.builder()
                .email("member@example.com")
                .password("secret")
                .firstName("Linus")
                .lastName("Torvalds")
                .memberType(MemberType.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(targetUser, "id", targetUserId);

        workspace = Workspace.builder()
                .name("Collabix")
                .status(WorkspaceStatus.ACTIVE)
                .owner(actor)
                .build();
        ReflectionTestUtils.setField(workspace, "id", workspaceId);

        team = Team.builder()
                .name("Platform")
                .status(WorkspaceStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(team, "id", teamId);

        WorkspaceMember actorMembership = WorkspaceMember.builder()
                .workspaceMemberId(new WorkspaceMemberId(workspace.getId(), actor.getId()))
                .workspace(workspace)
                .user(actor)
                .role(WorkspaceRole.ADMIN)
                .status(WorkspaceMemberStatus.ACTIVE)
                .joinedAt(Instant.now())
                .build();

        WorkspaceMember targetMembership = WorkspaceMember.builder()
                .workspaceMemberId(new WorkspaceMemberId(workspace.getId(), targetUser.getId()))
                .workspace(workspace)
                .user(targetUser)
                .role(WorkspaceRole.MEMBER)
                .status(WorkspaceMemberStatus.ACTIVE)
                .joinedAt(Instant.now())
                .build();

        lenient().when(userRepository.findByEmail(actor.getEmail())).thenReturn(Optional.of(actor));
        lenient().when(workspaceRepository.findById(workspace.getId())).thenReturn(Optional.of(workspace));
        lenient().when(workspaceMemberRepository.findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspace.getId(), actor.getId()))
                .thenReturn(Optional.of(actorMembership));
        lenient().when(workspaceMemberRepository.findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspace.getId(), targetUser.getId()))
                .thenReturn(Optional.of(targetMembership));
        lenient().when(workspaceMemberRepository.existsWithRole(workspace.getId(), actor.getId(), WorkspaceRole.ADMIN)).thenReturn(true);
        lenient().when(teamRepository.findByIdAndWorkspace_Id(team.getId(), workspace.getId())).thenReturn(Optional.of(team));
        lenient().when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CustomUserDetails(actor), null, java.util.List.of())
        );
    }

    @Test
    void addMemberShouldRejectTargetUserWhoIsNotWorkspaceMember() {
        AddTeamMemberRequest request = new AddTeamMemberRequest();
        request.setUserId(UUID.randomUUID());

        when(workspaceMemberRepository.findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspace.getId(), request.getUserId()))
                .thenReturn(Optional.empty());

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> teamMemberService.addMember(workspace.getId(), team.getId(), request));

        assertTrue(ex.getMessage().contains("member of this workspace"));
    }

    @Test
    void addMemberShouldPersistTeamMembership() {
        AddTeamMemberRequest request = new AddTeamMemberRequest();
        request.setUserId(targetUser.getId());

        TeamMember teamMember = TeamMember.builder()
                .teamMemberId(new TeamMemberId(team.getId(), targetUser.getId()))
                .team(team)
                .user(targetUser)
                .status(WorkspaceMemberStatus.ACTIVE)
                .build();

        lenient().when(workspaceMemberRepository.findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspace.getId(), targetUser.getId()))
                .thenReturn(Optional.of(WorkspaceMember.builder()
                        .workspaceMemberId(new WorkspaceMemberId(workspace.getId(), targetUser.getId()))
                        .workspace(workspace)
                        .user(targetUser)
                        .role(WorkspaceRole.MEMBER)
                        .status(WorkspaceMemberStatus.ACTIVE)
                        .joinedAt(Instant.now())
                        .build()));
        lenient().when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));
        lenient().when(teamMemberRepository.existsByTeamMemberId_TeamIdAndTeamMemberId_UserId(team.getId(), targetUser.getId())).thenReturn(false);
        when(teamMemberMapper.toEntity(request)).thenReturn(new TeamMember());
        when(teamMemberMapper.toResponse(any(TeamMember.class))).thenReturn(new com.trio.backend.dto.organisation.teamMember.TeamMemberResponse());
        when(teamMemberRepository.save(any(TeamMember.class))).thenReturn(teamMember);

        teamMemberService.addMember(workspace.getId(), team.getId(), request);

        verify(teamMemberRepository).save(any(TeamMember.class));
    }
}
