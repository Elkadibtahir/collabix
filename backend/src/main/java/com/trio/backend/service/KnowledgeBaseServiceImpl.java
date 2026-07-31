package com.trio.backend.service;

import com.trio.backend.dto.Knowledgebase.CreateKnowledgeBaseRequest;
import com.trio.backend.dto.Knowledgebase.UpdateKnowledgeBaseRequest;
import com.trio.backend.dto.Knowledgebase.KnowledgeBaseResponse;

import com.trio.backend.entity.KnowledgeBase;
import com.trio.backend.entity.Project;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.KnowledgeBaseMapper;
import com.trio.backend.repository.KnowledgeBaseRepository;
import com.trio.backend.repository.ProjectRepository;
import com.trio.backend.repository.WorkspaceMemberRepository;
import com.trio.backend.repository.WorkspaceRepository;
import com.trio.backend.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trio.backend.enums.ApprovalStatus;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation for Knowledge Lowe CRUD.
 *
 * Validation chain:
 * Workspace -> Department -> Project -> Knowledge Lowe
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class KnowledgeBaseServiceImpl implements KnowledgeBaseService {

    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final KnowledgeBaseMapper knowledgeBaseMapper;

    @Override
    public KnowledgeBaseResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            CreateKnowledgeBaseRequest request
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        Project project = projectRepository.findByIdAndDepartment_Id(projectId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (project.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Project not found.");
        }

        if (!project.getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Project not found.");
        }

        String normalizedTitle = normalizeTitle(request.getTitle());
        request.setTitle(normalizedTitle);

        KnowledgeBase knowledgeBase = knowledgeBaseMapper.toEntity(request);
        knowledgeBase.setProject(project);
        knowledgeBase.setStatus(KnowledgeBase.KnowledgeBaseStatus.ACTIVE);
        KnowledgeBase saved = knowledgeBaseRepository.save(knowledgeBase);
        return knowledgeBaseMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public KnowledgeBaseResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID knowledgeBaseId
    ) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findByIdAndWorkspace(knowledgeBaseId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge lowe article not found."));

        if (knowledgeBase.getStatus() == KnowledgeBase.KnowledgeBaseStatus.DELETED) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        if (!knowledgeBase.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        if (!knowledgeBase.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        return knowledgeBaseMapper.toResponse(knowledgeBase);
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<KnowledgeBaseResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            org.springframework.data.domain.Pageable pageable
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

        return knowledgeBaseRepository.findByProjectIdPaginated(projectId, pageable)
                .map(knowledgeBaseMapper::toResponse);
    }

    @Override
    public KnowledgeBaseResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId,
            UpdateKnowledgeBaseRequest request
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findByIdAndWorkspace(KnowledgeBaseId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge lowe article not found."));

        if (knowledgeBase.getStatus() == KnowledgeBase.KnowledgeBaseStatus.DELETED) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        if (!knowledgeBase.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        if (!knowledgeBase.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        if (request.getTitle() != null) {
            String normalizedTitle = normalizeTitle(request.getTitle());
            request.setTitle(normalizedTitle);
        }

        // Save snapshot of current version before updating
        KnowledgeBase snapshot = new KnowledgeBase();
        snapshot.setProject(knowledgeBase.getProject());
        snapshot.setTitle(knowledgeBase.getTitle());
        snapshot.setContent(knowledgeBase.getContent());
        snapshot.setSummary(knowledgeBase.getSummary());
        snapshot.setCategory(knowledgeBase.getCategory());
        snapshot.setTags(knowledgeBase.getTags());
        snapshot.setArticleVersion(knowledgeBase.getArticleVersion());
        snapshot.setStatus(KnowledgeBase.KnowledgeBaseStatus.ARCHIVED);
        snapshot.setIsPinned(knowledgeBase.getIsPinned());
        snapshot.setAiProcessed(knowledgeBase.getAiProcessed());
        snapshot.setAiSummary(knowledgeBase.getAiSummary());
        snapshot.setAiTags(knowledgeBase.getAiTags());
        snapshot.setRagEmbeddingsAvailable(knowledgeBase.getRagEmbeddingsAvailable());
        snapshot.setViewCount(knowledgeBase.getViewCount());
        snapshot.setFavoriteCount(knowledgeBase.getFavoriteCount());
        snapshot.setLastViewedAt(knowledgeBase.getLastViewedAt());
        snapshot.setLastViewedBy(knowledgeBase.getLastViewedBy());
        knowledgeBaseRepository.save(snapshot);

        knowledgeBaseMapper.updateKnowledgeBase(request, knowledgeBase);
        knowledgeBase.setArticleVersion(knowledgeBase.getArticleVersion() + 1);
        KnowledgeBase saved = knowledgeBaseRepository.save(knowledgeBase);
        return knowledgeBaseMapper.toResponse(saved);
    }

    @Override
    public void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findByIdAndWorkspace(KnowledgeBaseId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge lowe article not found."));

        if (knowledgeBase.getStatus() == KnowledgeBase.KnowledgeBaseStatus.DELETED) {
            return; // idempotent
        }

        if (!knowledgeBase.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        if (!knowledgeBase.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        knowledgeBase.setStatus(KnowledgeBase.KnowledgeBaseStatus.DELETED);
        knowledgeBaseRepository.save(knowledgeBase);
    }

    @Override
    @Transactional
    public KnowledgeBaseResponse submitForApproval(
            UUID workspaceId, UUID departmentId, UUID projectId, UUID KnowledgeBaseId
    ) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findByIdAndWorkspace(KnowledgeBaseId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge lowe article not found."));

        if (!knowledgeBase.getProject().getId().equals(projectId)
                || !knowledgeBase.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        knowledgeBase.setApprovalStatus(ApprovalStatus.PENDING);
        knowledgeBase.setApprovedBy(null);
        knowledgeBase.setApprovedAt(null);
        KnowledgeBase saved = knowledgeBaseRepository.save(knowledgeBase);
        return knowledgeBaseMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public KnowledgeBaseResponse approve(
            UUID workspaceId, UUID departmentId, UUID projectId, UUID KnowledgeBaseId
    ) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findByIdAndWorkspace(KnowledgeBaseId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge lowe article not found."));

        if (!knowledgeBase.getProject().getId().equals(projectId)
                || !knowledgeBase.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        if (knowledgeBase.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Knowledge lowe article is not pending approval.");
        }

        knowledgeBase.setApprovalStatus(ApprovalStatus.APPROVED);
        knowledgeBase.setApprovedBy(userId);
        knowledgeBase.setApprovedAt(Instant.now());
        KnowledgeBase saved = knowledgeBaseRepository.save(knowledgeBase);
        return knowledgeBaseMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public KnowledgeBaseResponse reject(
            UUID workspaceId, UUID departmentId, UUID projectId, UUID KnowledgeBaseId
    ) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findByIdAndWorkspace(KnowledgeBaseId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge lowe article not found."));

        if (!knowledgeBase.getProject().getId().equals(projectId)
                || !knowledgeBase.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        if (knowledgeBase.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Knowledge lowe article is not pending approval.");
        }

        knowledgeBase.setApprovalStatus(ApprovalStatus.REJECTED);
        knowledgeBase.setApprovedBy(userId);
        knowledgeBase.setApprovedAt(Instant.now());
        KnowledgeBase saved = knowledgeBaseRepository.save(knowledgeBase);
        return knowledgeBaseMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<KnowledgeBaseResponse> getVersionHistory(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId
    ) {
        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());
        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findByIdAndWorkspace(KnowledgeBaseId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge lowe article not found."));

        if (!knowledgeBase.getProject().getId().equals(projectId)
                || !knowledgeBase.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Knowledge lowe article not found.");
        }

        return knowledgeBaseRepository.findAllVersions(projectId, knowledgeBase.getTitle())
                .stream()
                .map(knowledgeBaseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<KnowledgeBaseResponse> listByCategory(
            UUID workspaceId, UUID departmentId, UUID projectId,
            String category, org.springframework.data.domain.Pageable pageable
    ) {
        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());
        return knowledgeBaseRepository.findByCategoryInProjectPaginated(projectId, category, pageable)
                .map(knowledgeBaseMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getCategories(UUID workspaceId, UUID departmentId, UUID projectId) {
        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());
        return knowledgeBaseRepository.findDistinctCategoriesByProjectId(projectId);
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

    private String normalizeTitle(String value) {
        if (value == null) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}

