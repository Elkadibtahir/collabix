package com.trio.backend.service;

import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.dto.notification.NotificationResponse;
import com.trio.backend.entity.*;
import com.trio.backend.entity.Notification.NotificationStatus;
import com.trio.backend.event.NotificationCreatedEvent;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.NotificationMapper;
import com.trio.backend.repository.*;
import com.trio.backend.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Implementation of the service management of notifications.
 *
 * <p>Validation de la hierarchy :</p>
 * <pre>
 * Workspace
 *    â†“
 * User recipient
 *    â†“
 * Notification
 * </pre>
 *
 * <p>Les notifications sont un module shared de la plateforme, used par
 * all departments (HR, Development, IA, Marketing, CybersÃ©curitÃ©, etc.).</p>
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final DocumentRepository documentRepository;
    private final KnowledgeBaseRepository KnowledgeBaseRepository;
    private final HandoverEntryRepository handoverEntryRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final NotificationMapper notificationMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public NotificationResponse create(UUID workspaceId, CreateNotificationRequest request) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found."));

        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient user not found."));

        Notification notification = notificationMapper.toEntity(request);
        notification.setWorkspace(workspace);
        notification.setRecipient(recipient);
        if (request.getPriority() != null) notification.setPriority(request.getPriority());
        if (request.getCategory() != null) notification.setCategory(request.getCategory());
        if (request.getGroupKey() != null) notification.setGroupKey(request.getGroupKey());

        // Optional resource references
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
            notification.setProject(project);
        }

        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found."));
            notification.setTask(task);
        }

        if (request.getCommentId() != null) {
            Comment comment = commentRepository.findById(request.getCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment not found."));
            notification.setComment(comment);
        }

        if (request.getDocumentId() != null) {
            Document document = documentRepository.findById(request.getDocumentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Document not found."));
            notification.setDocument(document);
        }

        if (request.getKnowledgeBaseId() != null) {
            KnowledgeBase KnowledgeBase = KnowledgeBaseRepository.findById(request.getKnowledgeBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Knowledge lowe article not found."));
            notification.setKnowledgeBase(KnowledgeBase);
        }

        if (request.getHandoverEntryId() != null) {
            HandoverEntry handoverEntry = handoverEntryRepository.findById(request.getHandoverEntryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Handover entry not found."));
            notification.setHandoverEntry(handoverEntry);
        }

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created: id={}, type={}, recipient={}, workspace={}",
                saved.getId(), saved.getNotificationType(), recipient.getId(), workspaceId);

        eventPublisher.publishEvent(new NotificationCreatedEvent(this, saved, recipient, workspaceId));

        return notificationMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getById(UUID workspaceId, UUID notificationId) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (notification.getStatus() == NotificationStatus.ARCHIVED) {
            throw new ResourceNotFoundException("Notification not found.");
        }

        if (!notification.getWorkspace().getId().equals(workspaceId)
                || !notification.getRecipient().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found.");
        }

        return notificationMapper.toResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> list(UUID workspaceId, UUID recipientId, Pageable pageable) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        return notificationRepository.findByWorkspaceIdAndRecipientId(workspaceId, recipientId, pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> listUnread(UUID workspaceId, UUID recipientId, Pageable pageable) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        return notificationRepository.findUnreadByRecipientId(recipientId, pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    public NotificationResponse markAsRead(UUID workspaceId, UUID notificationId) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (notification.getStatus() == NotificationStatus.ARCHIVED) {
            throw new ResourceNotFoundException("Notification not found.");
        }

        if (!notification.getWorkspace().getId().equals(workspaceId)
                || !notification.getRecipient().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found.");
        }

        if (notification.getStatus() == NotificationStatus.UNREAD) {
            notification.setStatus(NotificationStatus.READ);
            notification.setReadAt(Instant.now());
            Notification saved = notificationRepository.save(notification);
            log.info("Notification marked as read: id={}, recipient={}", notificationId, notification.getRecipient().getId());
            return notificationMapper.toResponse(saved);
        }

        return notificationMapper.toResponse(notification);
    }

    @Override
    public void markAllAsRead(UUID workspaceId, UUID recipientId) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        if (!recipientId.equals(userId)) {
            throw new ForbiddenException("You can only mark your own notifications as read.");
        }

        int updated = notificationRepository.markAllAsReadByRecipientAndWorkspace(recipientId, workspaceId, Instant.now());
        log.info("All notifications marked as read for recipient={} in workspace={}: count={}", recipientId, workspaceId, updated);
    }

    @Override
    public void delete(UUID workspaceId, UUID notificationId) {

        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (notification.getStatus() == NotificationStatus.ARCHIVED) {
            return; // idempotent
        }

        if (!notification.getWorkspace().getId().equals(workspaceId)
                || !notification.getRecipient().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found.");
        }

        notification.setStatus(NotificationStatus.ARCHIVED);
        notification.setReadAt(Instant.now());
        notificationRepository.save(notification);
        log.info("Notification archived (soft-delete): id={}, recipient={}", notificationId, notification.getRecipient().getId());
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(UUID workspaceId, UUID recipientId) {

        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        return notificationRepository.countUnreadByRecipientId(recipientId);
    }

    // ============================================================================
    // Helpers (pattern from ProjectServiceImpl / TaskServiceImpl)
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

        if (wm.getStatus() != com.trio.backend.enums.WorkspaceMemberStatus.ACTIVE) {
            throw new ForbiddenException("You are not an active member of this workspace.");
        }
    }
}
