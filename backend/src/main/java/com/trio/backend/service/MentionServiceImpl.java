package com.trio.backend.service;

import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.dto.organisation.mention.CreateMentionRequest;
import com.trio.backend.dto.organisation.mention.UpdateMentionRequest;
import com.trio.backend.dto.organisation.mention.MentionResponse;
import com.trio.backend.entity.Comment;
import com.trio.backend.entity.Mention;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.Task;
import com.trio.backend.entity.User;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.enums.CommentStatus;
import com.trio.backend.enums.TaskStatus;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.MentionMapper;
import com.trio.backend.repository.CommentRepository;
import com.trio.backend.repository.MentionRepository;
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
 * Implementation for Mention CRUD.
 *
 * <p>Validation chain:</p>
 * <pre>
 * Workspace -> Department -> Project -> Task -> Comment -> Mention
 * </pre>
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MentionServiceImpl implements MentionService {

    private final MentionRepository mentionRepository;
    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final MentionMapper mentionMapper;
    private final NotificationService notificationService;

    @Transactional
    @Override
    public MentionResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            CreateMentionRequest request
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        // Validate Complete yesterdayarchy: Workspace -> Department -> Project -> Task -> Comment
        Comment comment = commentRepository.findByIdAndTask_Id(commentId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found."));

        if (comment.getStatus() != CommentStatus.ACTIVE) {
            throw new ResourceNotFoundException("Comment not found.");
        }

        if (!comment.getTask().getId().equals(taskId)
                || !comment.getTask().getProject().getId().equals(projectId)
                || !comment.getTask().getProject().getDepartment().getId().equals(departmentId)
                || !comment.getTask().getProject().getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Comment not found.");
        }

        // Validate mentioned user exists and is member of workspace
        User mentionedUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        assertActiveWorkspaceMember(workspaceId, request.getUserId());

        // Create mention
        Mention mention = mentionMapper.toEntity(request);
        mention.setComment(comment);
        mention.setUser(mentionedUser);
        mention.setStatus(TaskStatus.ACTIVE);
        mention.setNotificationSent(false);

        Mention saved = mentionRepository.save(mention);

        // Dispatch notification to mentioned user
        CreateNotificationRequest notifRequest = new CreateNotificationRequest();
        notifRequest.setWorkspaceId(workspaceId);
        notifRequest.setRecipientId(request.getUserId());
        notifRequest.setNotificationType(Notification.NotificationType.MENTION);
        notifRequest.setTitle("You were mentioned in a comment");
        notifRequest.setBody(comment.getContent() != null
                ? comment.getContent().substring(0, Math.min(comment.getContent().length(), 200))
                : null);
        notifRequest.setCommentId(comment.getId());
        notifRequest.setTaskId(taskId);
        notifRequest.setProjectId(projectId);

        notificationService.create(workspaceId, notifRequest);

        // Mark notification as sent
        saved.setNotificationSent(true);
        mentionRepository.save(saved);

        return mentionMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public MentionResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            UUID mentionId
    ) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        // Validate Complete yesterdayarchy
        Mention mention = mentionRepository.findByIdAndWorkspace(mentionId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Mention not found."));

        if (mention.getStatus() != TaskStatus.ACTIVE) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getId().equals(commentId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getTask().getId().equals(taskId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getTask().getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getTask().getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        return mentionMapper.toResponse(mention);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<MentionResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            Pageable pageable
    ) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        // Validate Complete yesterdayarchy
        Comment comment = commentRepository.findByIdAndTask_Id(commentId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found."));

        if (comment.getStatus() != CommentStatus.ACTIVE) {
            throw new ResourceNotFoundException("Comment not found.");
        }

        if (!comment.getTask().getId().equals(taskId)) {
            throw new ResourceNotFoundException("Comment not found.");
        }

        if (!comment.getTask().getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Comment not found.");
        }

        if (!comment.getTask().getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Comment not found.");
        }

        if (!comment.getTask().getProject().getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Comment not found.");
        }

        return mentionRepository.findByCommentIdPaginated(commentId, pageable)
                .map(mentionMapper::toResponse);
    }

    @Transactional
    @Override
    public MentionResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            UUID mentionId,
            UpdateMentionRequest request
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        // Validate Complete yesterdayarchy
        Mention mention = mentionRepository.findByIdAndWorkspace(mentionId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Mention not found."));

        if (mention.getStatus() != TaskStatus.ACTIVE) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getId().equals(commentId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getTask().getId().equals(taskId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getTask().getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getTask().getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        mentionMapper.updateMention(request, mention);
        Mention saved = mentionRepository.save(mention);
        return mentionMapper.toResponse(saved);
    }

    @Transactional
    @Override
    public void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            UUID mentionId
    ) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        // Validate Complete yesterdayarchy
        Mention mention = mentionRepository.findByIdAndWorkspace(mentionId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Mention not found."));

        if (mention.getStatus() != TaskStatus.ACTIVE) {
            return; // idempotent
        }

        if (!mention.getComment().getId().equals(commentId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getTask().getId().equals(taskId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getTask().getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        if (!mention.getComment().getTask().getProject().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Mention not found.");
        }

        mention.setStatus(TaskStatus.ARCHIVED);
        mentionRepository.save(mention);
    }

    // ============================================================================
    // Helpers (pattern inspired by CommentServiceImpl)
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
