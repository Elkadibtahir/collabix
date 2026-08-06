package com.trio.backend.service;

import com.trio.backend.dto.organisation.attachment.CreateAttachmentRequest;
import com.trio.backend.dto.organisation.attachment.UpdateAttachmentRequest;
import com.trio.backend.dto.organisation.attachment.AttachmentResponse;
import com.trio.backend.entity.Attachment;
import com.trio.backend.entity.Comment;
import com.trio.backend.entity.Task;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.enums.CommentStatus;
import com.trio.backend.enums.TaskStatus;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.AttachmentMapper;
import com.trio.backend.repository.AttachmentRepository;
import com.trio.backend.repository.CommentRepository;
import com.trio.backend.repository.TaskRepository;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation for Attachment CRUD.
 *
 * <p>Validation chain:</p>
 * <pre>
 * Workspace -> Department -> Project -> Task -> Attachment
 * </pre>
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final AttachmentMapper attachmentMapper;

    @Override
    @Transactional
    public AttachmentResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            CreateAttachmentRequest request
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        Task task = taskRepository.findByIdAndProject_Id(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));

        if (task.getStatus().isTerminal()) {
            throw new ResourceNotFoundException("Task not found.");
        }

        if (!task.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Task not found.");
        }

        if (!task.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Task not found.");
        }

        if (!task.getProject().getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Task not found.");
        }

        Attachment attachment = attachmentMapper.toEntity(request);
        attachment.setTask(task);
        attachment.setStatus(Attachment.AttachmentStatus.ACTIVE);

        if (request.getCommentId() != null) {
            Comment comment = commentRepository.findByIdAndTask_Id(request.getCommentId(), taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Comment not found."));
            if (comment.getStatus() != CommentStatus.ACTIVE) {
                throw new ResourceNotFoundException("Comment not found.");
            }
            attachment.setComment(comment);
        }

        Attachment saved = attachmentRepository.save(attachment);
        return attachmentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID attachmentId
    ) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        Attachment attachment = attachmentRepository.findByIdAndWorkspace(attachmentId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found."));

        if (attachment.getStatus() != Attachment.AttachmentStatus.ACTIVE) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        if (!attachment.getTask().getId().equals(taskId)) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        if (!attachment.getTask().getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        if (!attachment.getTask().getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        return attachmentMapper.toResponse(attachment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttachmentResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            Pageable pageable
    ) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        Task task = taskRepository.findByIdAndProject_Id(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));

        if (task.getStatus().isTerminal()) {
            throw new ResourceNotFoundException("Task not found.");
        }

        if (!task.getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Task not found.");
        }

        if (!task.getProject().getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Task not found.");
        }

        return attachmentRepository.findByTaskIdPaginated(taskId, pageable)
                .map(attachmentMapper::toResponse);
    }

    @Override
    @Transactional
    public AttachmentResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID attachmentId,
            UpdateAttachmentRequest request
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        Attachment attachment = attachmentRepository.findByIdAndWorkspace(attachmentId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found."));

        if (attachment.getStatus() != Attachment.AttachmentStatus.ACTIVE) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        if (!attachment.getTask().getId().equals(taskId)) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        if (!attachment.getTask().getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        if (!attachment.getTask().getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        attachmentMapper.updateAttachment(request, attachment);
        Attachment saved = attachmentRepository.save(attachment);
        return attachmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID attachmentId
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        Attachment attachment = attachmentRepository.findByIdAndWorkspace(attachmentId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found."));

        if (attachment.getStatus() != Attachment.AttachmentStatus.ACTIVE) {
            return; // idempotent
        }

        if (!attachment.getTask().getId().equals(taskId)) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        if (!attachment.getTask().getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        if (!attachment.getTask().getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Attachment not found.");
        }

        attachment.setStatus(Attachment.AttachmentStatus.DELETED);
        attachmentRepository.save(attachment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentResponse> listByComment(
            UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID commentId
    ) {
        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        Task task = taskRepository.findByIdAndProject_Id(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));

        if (!task.getProject().getDepartment().getId().equals(departmentId)
                || !task.getProject().getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Task not found.");
        }

        Comment comment = commentRepository.findByIdAndTask_Id(commentId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found."));

        return attachmentRepository.findByCommentId(comment.getId())
                .stream()
                .map(attachmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================================================
    // Helpers (pattern inspired by TaskServiceImpl)
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
