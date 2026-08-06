package com.trio.backend.service;

import com.trio.backend.dto.organisation.team.CreateTeamRequest;
import com.trio.backend.dto.organisation.team.UpdateTeamRequest;
import com.trio.backend.entity.Department;
import com.trio.backend.entity.Team;
import com.trio.backend.entity.User;
import com.trio.backend.entity.Workspace;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.entity.ids.WorkspaceMemberId;
import com.trio.backend.enums.MemberType;
import com.trio.backend.enums.UserStatus;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.mapper.TeamMapper;
import com.trio.backend.repository.DepartmentRepository;
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
class TeamServiceImplTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamMapper teamMapper;

    @InjectMocks
    private TeamServiceImpl teamService;

    private User actor;
    private Workspace workspace;
    private Department department;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        UUID actorId = UUID.randomUUID();
        UUID workspaceId = UUID.randomUUID();
        UUID departmentId = UUID.randomUUID();

        actor = User.builder()
                .email("manager@example.com")
                .password("secret")
                .firstName("Grace")
                .lastName("Hopper")
                .memberType(MemberType.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(actor, "id", actorId);

        workspace = Workspace.builder()
                .name("Collabix")
                .status(WorkspaceStatus.ACTIVE)
                .owner(actor)
                .build();
        ReflectionTestUtils.setField(workspace, "id", workspaceId);

        department = Department.builder()
                .name("Engineering")
                .status(WorkspaceStatus.ACTIVE)
                .workspace(workspace)
                .build();
        ReflectionTestUtils.setField(department, "id", departmentId);

        WorkspaceMember workspaceMember = WorkspaceMember.builder()
                .workspaceMemberId(new WorkspaceMemberId(workspace.getId(), actor.getId()))
                .workspace(workspace)
                .user(actor)
                .role(WorkspaceRole.ADMIN)
                .status(WorkspaceMemberStatus.ACTIVE)
                .joinedAt(Instant.now())
                .build();

        lenient().when(userRepository.findByEmail(actor.getEmail())).thenReturn(Optional.of(actor));
        when(workspaceRepository.findById(workspace.getId())).thenReturn(Optional.of(workspace));
        // TeamServiceImpl uses findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId
        lenient().when(workspaceMemberRepository.findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspace.getId(), actor.getId()))
                .thenReturn(Optional.of(workspaceMember));
        lenient().when(workspaceMemberRepository.existsWithRole(workspace.getId(), actor.getId(), WorkspaceRole.ADMIN)).thenReturn(true);
        lenient().when(departmentRepository.findByIdAndWorkspace_Id(department.getId(), workspace.getId())).thenReturn(Optional.of(department));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CustomUserDetails(actor), null, java.util.List.of())
        );
    }

    @Test
    void createShouldRejectDuplicateTeamName() {
        CreateTeamRequest request = new CreateTeamRequest();
        request.setName("Platform");

        // Service normalizes name (trim + lower)
        when(teamRepository.existsByWorkspace_IdAndDepartment_IdAndName(workspace.getId(), department.getId(), "platform"))
                .thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class,
                () -> teamService.create(workspace.getId(), department.getId(), request));

        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    void createShouldAllowAdminToCreateTeam() {
        CreateTeamRequest request = new CreateTeamRequest();
        request.setName("Platform");

        Team team = Team.builder()
                .name("Platform")
                .status(WorkspaceStatus.ACTIVE)
                .department(department)
                .build();

        when(teamRepository.existsByWorkspace_IdAndDepartment_IdAndName(workspace.getId(), department.getId(), "platform")).thenReturn(false);
        when(teamMapper.toEntity(request)).thenReturn(new Team());
        when(teamRepository.save(any(Team.class))).thenReturn(team);
        when(teamMapper.toResponse(team)).thenReturn(new com.trio.backend.dto.organisation.team.TeamResponse());

        teamService.create(workspace.getId(), department.getId(), request);

        verify(teamRepository).save(any(Team.class));
    }

    @Test
    void updateShouldRejectNonAdminUser() {
        User nonAdminUser = User.builder().build();
        ReflectionTestUtils.setField(nonAdminUser, "id", UUID.randomUUID());

        WorkspaceMember nonAdminMember = WorkspaceMember.builder()
                .workspaceMemberId(new WorkspaceMemberId(workspace.getId(), nonAdminUser.getId()))
                .workspace(workspace)
                .user(nonAdminUser)
                .role(WorkspaceRole.MEMBER)
                .status(WorkspaceMemberStatus.ACTIVE)
                .joinedAt(Instant.now())
                .build();

        when(workspaceMemberRepository.findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspace.getId(), actor.getId()))
                .thenReturn(Optional.of(nonAdminMember));
        when(workspaceMemberRepository.existsWithRole(workspace.getId(), actor.getId(), WorkspaceRole.ADMIN)).thenReturn(false);
        when(workspaceRepository.findById(workspace.getId())).thenReturn(Optional.empty());

        UpdateTeamRequest request = new UpdateTeamRequest();
        request.setName("Ops");

        Team existingTeam = Team.builder()
                .name("Platform")
                .status(WorkspaceStatus.ACTIVE)
                .department(department)
                .build();
        ReflectionTestUtils.setField(existingTeam, "id", UUID.randomUUID());

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> teamService.update(workspace.getId(), department.getId(), existingTeam.getId(), request));

        assertTrue(ex.getMessage().contains("permission"));
    }
}
