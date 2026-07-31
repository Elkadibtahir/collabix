package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.CreateHandoverEntryRequest;
import com.trio.backend.dto.organisation.handover.HandoverEntryResponse;
import com.trio.backend.dto.organisation.handover.UpdateHandoverEntryRequest;
import com.trio.backend.entity.HandoverEntry;
import com.trio.backend.entity.Project;
import com.trio.backend.entity.Task;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Implementation for HandoverEntry CRUD.
 *
 * <p>Validation chain:</p>
 * <pre>
 * Workspace -> Department -> Project -> Task (optional) -> HandoverEntry
 * </pre>
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class HandoverEntryServiceImpl implements HandoverEntryService {

    private final HandoverEntryRepository handoverEntryRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final HandoverEntryMapper handoverEntryMapper;

    @Override
    @Transactional
    public HandoverEntryResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            CreateHandoverEntryRequest request
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        Project project = projectRepository.findByIdAndDepartment_Id(projectId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (project.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Project not found.");
        }

        if (!project.getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Project not found.");
        }

        HandoverEntry handover = handoverEntryMapper.toEntity(request);
        handover.setWorkspace(project.getDepartment().getWorkspace());
        handover.setDepartment(project.getDepartment());
        handover.setProject(project);
        handover.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found.")));
        handover.setStatus(HandoverEntry.HandoverEntryStatus.ACTIVE);

        HandoverEntry saved = handoverEntryRepository.save(handover);
        return handoverEntryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public HandoverEntryResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID handoverEntryId
    ) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        HandoverEntry handover = handoverEntryRepository.findByIdAndWorkspace(handoverEntryId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover entry not found."));

        if (handover.getStatus() != HandoverEntry.HandoverEntryStatus.ACTIVE) {
            throw new ResourceNotFoundException("Handover entry not found.");
        }

        if (!handover.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Handover entry not found.");
        }

        if (!handover.getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Handover entry not found.");
        }

        return handoverEntryMapper.toResponse(handover);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HandoverEntryResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            Pageable pageable
    ) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        Project project = projectRepository.findByIdAndDepartment_Id(projectId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (project.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Project not found.");
        }

        if (!project.getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Project not found.");
        }

        // Repository supports findByProjectIdPaginated.
        return handoverEntryRepository.findByProjectIdPaginated(projectId, pageable)
                .map(handoverEntryMapper::toResponse);
    }

    @Override
    @Transactional
    public HandoverEntryResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID handoverEntryId,
            UpdateHandoverEntryRequest request
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        HandoverEntry handover = handoverEntryRepository.findByIdAndWorkspace(handoverEntryId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover entry not found."));

        if (handover.getStatus() != HandoverEntry.HandoverEntryStatus.ACTIVE) {
            throw new ResourceNotFoundException("Handover entry not found.");
        }

        if (!handover.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Handover entry not found.");
        }

        if (!handover.getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Handover entry not found.");
        }

        handoverEntryMapper.updateHandoverEntry(request, handover);
        HandoverEntry saved = handoverEntryRepository.save(handover);
        return handoverEntryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID handoverEntryId
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        HandoverEntry handover = handoverEntryRepository.findByIdAndWorkspace(handoverEntryId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover entry not found."));

        if (handover.getStatus() == HandoverEntry.HandoverEntryStatus.DELETED) {
            return; // idempotent
        }

        if (handover.getStatus() != HandoverEntry.HandoverEntryStatus.ACTIVE) {
            return; // idempotent for ARCHIVED
        }

        if (!handover.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Handover entry not found.");
        }

        if (!handover.getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Handover entry not found.");
        }

        handover.setStatus(HandoverEntry.HandoverEntryStatus.DELETED);
        handoverEntryRepository.save(handover);
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

