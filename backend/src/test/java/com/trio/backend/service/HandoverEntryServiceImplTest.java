package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.CreateHandoverEntryRequest;
import com.trio.backend.dto.organisation.handover.HandoverEntryResponse;
import com.trio.backend.dto.organisation.handover.UpdateHandoverEntryRequest;
import com.trio.backend.entity.*;
import com.trio.backend.entity.ids.WorkspaceMemberId;
import com.trio.backend.enums.*;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.HandoverEntryMapper;
import com.trio.backend.repository.HandoverEntryRepository;
import com.trio.backend.repository.ProjectRepository;
import com.trio.backend.repository.TaskRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HandoverEntryServiceImplTest {

    @Mock
    private HandoverEntryRepository handoverEntryRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;
    @Mock
    private WorkspaceRepository workspaceRepository;
    @Mock
    private HandoverEntryMapper handoverEntryMapper;

    @InjectMocks
    private HandoverEntryServiceImpl handoverEntryService;

    private User actor;
    private Workspace workspace;
    private Department department;
    private Project project;
    private WorkspaceMember workspaceMember;
    private HandoverEntry exampleEntry;
    private HandoverEntryResponse exampleResponse;
    private UUID wsId;
    private UUID deptId;
    private UUID projId;
    private UUID entryId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        userId = UUID.randomUUID();
        wsId = UUID.randomUUID();
        deptId = UUID.randomUUID();
        projId = UUID.randomUUID();
        entryId = UUID.randomUUID();

        actor = User.builder()
                .email("user@example.com")
                .password("secret")
                .firstName("Test")
                .lastName("User")
                .memberType(MemberType.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(actor, "id", userId);

        workspace = Workspace.builder()
                .name("TestWorkspace")
                .status(WorkspaceStatus.ACTIVE)
                .owner(actor)
                .build();
        ReflectionTestUtils.setField(workspace, "id", wsId);

        department = Department.builder()
                .name("TestDept")
                .status(WorkspaceStatus.ACTIVE)
                .workspace(workspace)
                .build();
        ReflectionTestUtils.setField(department, "id", deptId);

        project = Project.builder()
                .name("TestProject")
                .status(WorkspaceStatus.ACTIVE)
                .department(department)
                .build();
        ReflectionTestUtils.setField(project, "id", projId);

        workspaceMember = WorkspaceMember.builder()
                .workspaceMemberId(new WorkspaceMemberId(wsId, userId))
                .workspace(workspace)
                .user(actor)
                .role(WorkspaceRole.MEMBER)
                .status(WorkspaceMemberStatus.ACTIVE)
                .joinedAt(Instant.now())
                .build();

        exampleEntry = HandoverEntry.builder()
                .workspace(workspace)
                .department(department)
                .project(project)
                .user(actor)
                .workFinished("Finished work")
                .workRemaining("Remaining work")
                .difficulties("None")
                .blockers("None")
                .importantInformation("All good")
                .priorities("High")
                .timeSpentMinutes(480L)
                .needHelp(false)
                .shift(HandoverEntry.Shift.MORNING)
                .status(HandoverEntry.HandoverEntryStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(exampleEntry, "id", entryId);

        exampleResponse = new HandoverEntryResponse();

        lenient().when(workspaceMemberRepository
                        .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(wsId, userId))
                .thenReturn(Optional.of(workspaceMember));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CustomUserDetails(actor), null, List.of())
        );
    }

    @Test
    void createShouldSucceed() {
        CreateHandoverEntryRequest request = new CreateHandoverEntryRequest();
        ReflectionTestUtils.setField(request, "shift", HandoverEntry.Shift.MORNING);

        when(projectRepository.findByIdAndDepartment_Id(projId, deptId)).thenReturn(Optional.of(project));
        when(handoverEntryMapper.toEntity(request)).thenReturn(new HandoverEntry());
        when(userRepository.findById(userId)).thenReturn(Optional.of(actor));
        when(handoverEntryRepository.save(any(HandoverEntry.class))).thenReturn(exampleEntry);
        when(handoverEntryMapper.toResponse(exampleEntry)).thenReturn(exampleResponse);

        HandoverEntryResponse result = handoverEntryService.create(wsId, deptId, projId, request);

        assertNotNull(result);
        verify(handoverEntryRepository).save(any(HandoverEntry.class));
    }

    @Test
    void createShouldThrowWhenProjectNotFound() {
        when(projectRepository.findByIdAndDepartment_Id(projId, deptId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> handoverEntryService.create(wsId, deptId, projId, new CreateHandoverEntryRequest()));
    }

    @Test
    void createShouldThrowWhenProjectInactive() {
        project.setStatus(WorkspaceStatus.ARCHIVED);
        when(projectRepository.findByIdAndDepartment_Id(projId, deptId)).thenReturn(Optional.of(project));

        assertThrows(ResourceNotFoundException.class,
                () -> handoverEntryService.create(wsId, deptId, projId, new CreateHandoverEntryRequest()));
    }

    @Test
    void createShouldThrowForNonMember() {
        UUID otherUserId = UUID.randomUUID();
        User otherUser = User.builder().firstName("Other").build();
        ReflectionTestUtils.setField(otherUser, "id", otherUserId);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new CustomUserDetails(otherUser), null, List.of())
        );
        when(workspaceMemberRepository
                        .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(wsId, otherUserId))
                .thenReturn(Optional.empty());

        assertThrows(ForbiddenException.class,
                () -> handoverEntryService.create(wsId, deptId, projId, new CreateHandoverEntryRequest()));
    }

    @Test
    void getByIdShouldReturnEntry() {
        when(handoverEntryRepository.findByIdAndWorkspace(entryId, wsId)).thenReturn(Optional.of(exampleEntry));
        when(handoverEntryMapper.toResponse(exampleEntry)).thenReturn(exampleResponse);

        HandoverEntryResponse result = handoverEntryService.getById(wsId, deptId, projId, entryId);

        assertNotNull(result);
    }

    @Test
    void getByIdShouldThrowWhenNotFound() {
        when(handoverEntryRepository.findByIdAndWorkspace(entryId, wsId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> handoverEntryService.getById(wsId, deptId, projId, entryId));
    }

    @Test
    void getByIdShouldThrowWhenDeleted() {
        exampleEntry.setStatus(HandoverEntry.HandoverEntryStatus.DELETED);
        when(handoverEntryRepository.findByIdAndWorkspace(entryId, wsId)).thenReturn(Optional.of(exampleEntry));

        assertThrows(ResourceNotFoundException.class,
                () -> handoverEntryService.getById(wsId, deptId, projId, entryId));
    }

    @Test
    void getByIdShouldThrowWhenProjectMismatch() {
        Project otherProject = Project.builder().build();
        ReflectionTestUtils.setField(otherProject, "id", UUID.randomUUID());
        exampleEntry.setProject(otherProject);
        when(handoverEntryRepository.findByIdAndWorkspace(entryId, wsId)).thenReturn(Optional.of(exampleEntry));

        assertThrows(ResourceNotFoundException.class,
                () -> handoverEntryService.getById(wsId, deptId, projId, entryId));
    }

    @Test
    void listShouldReturnPaginatedResults() {
        Page<HandoverEntry> page = new PageImpl<>(List.of(exampleEntry));
        when(projectRepository.findByIdAndDepartment_Id(projId, deptId)).thenReturn(Optional.of(project));
        when(handoverEntryRepository.findByProjectIdPaginated(eq(projId), any(PageRequest.class))).thenReturn(page);
        when(handoverEntryMapper.toResponse(exampleEntry)).thenReturn(exampleResponse);

        Page<HandoverEntryResponse> result = handoverEntryService.list(wsId, deptId, projId, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void updateShouldSucceedForAdmin() {
        workspaceMember.setRole(WorkspaceRole.ADMIN);
        when(workspaceMemberRepository.existsWithRole(wsId, userId, WorkspaceRole.ADMIN)).thenReturn(true);

        UpdateHandoverEntryRequest request = new UpdateHandoverEntryRequest();
        when(handoverEntryRepository.findByIdAndWorkspace(entryId, wsId)).thenReturn(Optional.of(exampleEntry));
        when(handoverEntryRepository.save(any(HandoverEntry.class))).thenReturn(exampleEntry);
        when(handoverEntryMapper.toResponse(exampleEntry)).thenReturn(exampleResponse);

        HandoverEntryResponse result = handoverEntryService.update(wsId, deptId, projId, entryId, request);

        assertNotNull(result);
        verify(handoverEntryMapper).updateHandoverEntry(request, exampleEntry);
    }

    @Test
    void updateShouldSucceedForOwner() {
        when(workspaceMemberRepository.existsWithRole(wsId, userId, WorkspaceRole.ADMIN)).thenReturn(false);
        when(workspaceRepository.findById(wsId)).thenReturn(Optional.of(workspace));

        UpdateHandoverEntryRequest request = new UpdateHandoverEntryRequest();
        when(handoverEntryRepository.findByIdAndWorkspace(entryId, wsId)).thenReturn(Optional.of(exampleEntry));
        when(handoverEntryRepository.save(any(HandoverEntry.class))).thenReturn(exampleEntry);
        when(handoverEntryMapper.toResponse(exampleEntry)).thenReturn(exampleResponse);

        HandoverEntryResponse result = handoverEntryService.update(wsId, deptId, projId, entryId, request);

        assertNotNull(result);
        verify(handoverEntryMapper).updateHandoverEntry(request, exampleEntry);
    }

    @Test
    void updateShouldThrowForNonAdmin() {
        when(workspaceMemberRepository.existsWithRole(wsId, userId, WorkspaceRole.ADMIN)).thenReturn(false);
        when(workspaceRepository.findById(wsId)).thenReturn(Optional.empty());

        assertThrows(ForbiddenException.class,
                () -> handoverEntryService.update(wsId, deptId, projId, entryId, new UpdateHandoverEntryRequest()));
    }

    @Test
    void deleteShouldSoftDelete() {
        when(workspaceMemberRepository.existsWithRole(wsId, userId, WorkspaceRole.ADMIN)).thenReturn(true);
        when(handoverEntryRepository.findByIdAndWorkspace(entryId, wsId)).thenReturn(Optional.of(exampleEntry));

        handoverEntryService.delete(wsId, deptId, projId, entryId);

        assertEquals(HandoverEntry.HandoverEntryStatus.DELETED, exampleEntry.getStatus());
        verify(handoverEntryRepository).save(exampleEntry);
    }

    @Test
    void deleteShouldBeIdempotentWhenAlreadyDeleted() {
        exampleEntry.setStatus(HandoverEntry.HandoverEntryStatus.DELETED);
        when(workspaceMemberRepository.existsWithRole(wsId, userId, WorkspaceRole.ADMIN)).thenReturn(true);
        when(handoverEntryRepository.findByIdAndWorkspace(entryId, wsId)).thenReturn(Optional.of(exampleEntry));

        handoverEntryService.delete(wsId, deptId, projId, entryId);

        verify(handoverEntryRepository, never()).save(any());
    }

    @Test
    void deleteShouldThrowWhenNonAdmin() {
        when(workspaceMemberRepository.existsWithRole(wsId, userId, WorkspaceRole.ADMIN)).thenReturn(false);
        when(workspaceRepository.findById(wsId)).thenReturn(Optional.empty());

        assertThrows(ForbiddenException.class,
                () -> handoverEntryService.delete(wsId, deptId, projId, entryId));
    }
}
