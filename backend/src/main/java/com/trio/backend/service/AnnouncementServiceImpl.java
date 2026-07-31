package com.trio.backend.service;

import com.trio.backend.dto.announcement.AnnouncementResponse;
import com.trio.backend.dto.announcement.CreateAnnouncementRequest;
import com.trio.backend.dto.announcement.UpdateAnnouncementRequest;
import com.trio.backend.entity.*;
import com.trio.backend.enums.AnnouncementStatus;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.AnnouncementMapper;
import com.trio.backend.repository.*;
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

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final WorkspaceRepository workspaceRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final AnnouncementMapper announcementMapper;

    @Override
    public AnnouncementResponse create(UUID workspaceId, CreateAnnouncementRequest request) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found."));

        Announcement announcement = announcementMapper.toEntity(request);
        announcement.setWorkspace(workspace);
        announcement.setStatus(AnnouncementStatus.ACTIVE);

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
            announcement.setDepartment(department);
        }

        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found."));
            announcement.setTeam(team);
        }

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
            announcement.setProject(project);
        }

        Announcement saved = announcementRepository.save(announcement);
        log.info("Announcement created: id={}, title={}, workspace={}", saved.getId(), saved.getTitle(), workspaceId);

        return announcementMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AnnouncementResponse getById(UUID workspaceId, UUID announcementId) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        Announcement announcement = announcementRepository.findByIdAndWorkspace(announcementId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));

        return announcementMapper.toResponse(announcement);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> listWorkspaceAnnouncements(UUID workspaceId, Pageable pageable) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        return announcementRepository.findWorkspaceAnnouncements(workspaceId, pageable)
                .map(announcementMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> listDepartmentAnnouncements(UUID workspaceId, UUID departmentId, Pageable pageable) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        return announcementRepository.findDepartmentAnnouncements(workspaceId, departmentId, pageable)
                .map(announcementMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> listTeamAnnouncements(UUID workspaceId, UUID teamId, Pageable pageable) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        return announcementRepository.findTeamAnnouncements(workspaceId, teamId, pageable)
                .map(announcementMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> listProjectAnnouncements(UUID workspaceId, UUID projectId, Pageable pageable) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        return announcementRepository.findProjectAnnouncements(workspaceId, projectId, pageable)
                .map(announcementMapper::toResponse);
    }

    @Override
    public AnnouncementResponse update(UUID workspaceId, UUID announcementId, UpdateAnnouncementRequest request) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        Announcement announcement = announcementRepository.findByIdAndWorkspace(announcementId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));

        announcementMapper.updateAnnouncement(request, announcement);
        Announcement saved = announcementRepository.save(announcement);
        return announcementMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID workspaceId, UUID announcementId) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        Announcement announcement = announcementRepository.findByIdAndWorkspace(announcementId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));

        if (announcement.getStatus() == AnnouncementStatus.ARCHIVED) {
            return;
        }

        announcement.setStatus(AnnouncementStatus.ARCHIVED);
        announcementRepository.save(announcement);
        log.info("Announcement archived: id={}", announcementId);
    }

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
}
