package com.trio.backend.service;

import com.trio.backend.dto.organisation.department.CreateDepartmentRequest;
import com.trio.backend.dto.organisation.department.UpdateDepartmentRequest;
import com.trio.backend.entity.Department;
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
import com.trio.backend.mapper.DepartmentMapper;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceImplTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentMapper departmentMapper;

    @InjectMocks
    private DepartmentServiceImpl departmentService;

    private User actor;
    private Workspace workspace;
    private WorkspaceMember workspaceMember;
    private Department department;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        UUID actorId = UUID.randomUUID();
        UUID workspaceId = UUID.randomUUID();

        actor = User.builder()
                .email("admin@example.com")
                .password("secret")
                .firstName("Ada")
                .lastName("Lovelace")
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
        ReflectionTestUtils.setField(department, "id", UUID.randomUUID());

        workspaceMember = WorkspaceMember.builder()
                .workspaceMemberId(new WorkspaceMemberId(workspace.getId(), actor.getId()))
                .workspace(workspace)
                .user(actor)
                .role(WorkspaceRole.ADMIN)
                .status(WorkspaceMemberStatus.ACTIVE)
                .joinedAt(Instant.now())
                .build();

        lenient().when(userRepository.findByEmail(actor.getEmail())).thenReturn(Optional.of(actor));
        lenient().when(workspaceMemberRepository.findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspace.getId(), actor.getId()))
                .thenReturn(Optional.of(workspaceMember));
        lenient().when(workspaceMemberRepository.existsWithRole(workspace.getId(), actor.getId(), WorkspaceRole.ADMIN)).thenReturn(true);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CustomUserDetails(actor), null, java.util.List.of())
        );
    }

    @Test
    void createShouldThrowConflictWhenDepartmentNameAlreadyExists() {
        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setName("Engineering");

        when(departmentRepository.existsByWorkspace_IdAndName(workspace.getId(), "engineering")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class,
                () -> departmentService.create(workspace.getId(), request));

        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    void createShouldAllowAdminToCreateDepartment() {
        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setName("Engineering");

        Department department = Department.builder()
                .name("Engineering")
                .status(WorkspaceStatus.ACTIVE)
                .workspace(workspace)
                .build();

        when(workspaceRepository.findById(workspace.getId())).thenReturn(Optional.of(workspace));
        when(departmentRepository.existsByWorkspace_IdAndName(workspace.getId(), "engineering")).thenReturn(false);
        when(departmentMapper.toEntity(request)).thenReturn(new Department());
        when(departmentRepository.save(any(Department.class))).thenReturn(department);
        when(departmentMapper.toResponse(department)).thenReturn(new com.trio.backend.dto.organisation.department.DepartmentResponse());

        departmentService.create(workspace.getId(), request);

        verify(departmentRepository).save(any(Department.class));
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

        UpdateDepartmentRequest request = new UpdateDepartmentRequest();
        request.setName("Ops");

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> departmentService.update(workspace.getId(), department.getId(), request));

        assertTrue(ex.getMessage().contains("permission"));
    }
}
