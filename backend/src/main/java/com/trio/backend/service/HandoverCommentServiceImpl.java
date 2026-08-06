package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.CreateHandoverCommentRequest;
import com.trio.backend.dto.organisation.handover.HandoverCommentResponse;
import com.trio.backend.dto.organisation.handover.UpdateHandoverCommentRequest;
import com.trio.backend.entity.HandoverComment;
import com.trio.backend.entity.HandoverEntry;
import com.trio.backend.entity.HandoverTimelineEvent.TimelineEventType;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.User;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.HandoverCommentMapper;
import com.trio.backend.repository.HandoverCommentRepository;
import com.trio.backend.repository.HandoverEntryRepository;
import com.trio.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Implementation for comments on HandoverEntry.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class HandoverCommentServiceImpl implements HandoverCommentService {

    private final HandoverCommentRepository commentRepository;
    private final HandoverEntryRepository handoverEntryRepository;
    private final UserRepository userRepository;
    private final HandoverCommentMapper commentMapper;
    private final HandoverSupport support;

    @Override
    @Transactional(readOnly = true)
    public List<HandoverCommentResponse> list(UUID workspaceId, UUID handoverEntryId) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);
        findEntry(workspaceId, handoverEntryId);
        return commentRepository.findByHandoverEntryIdAndWorkspaceId(handoverEntryId, workspaceId).stream()
                .map(commentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public HandoverCommentResponse create(UUID workspaceId, UUID handoverEntryId, CreateHandoverCommentRequest request) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);

        HandoverEntry entry = findEntry(workspaceId, handoverEntryId);
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        HandoverComment comment = HandoverComment.builder()
                .handoverEntry(entry)
                .author(author)
                .content(request.getContent())
                .build();
        HandoverComment saved = commentRepository.save(comment);

        support.addTimelineEvent(entry, TimelineEventType.COMMENTED, "Comment added by " + support.userDisplayName(author), userId);
        notifyParticipants(workspaceId, entry, userId);

        return commentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public HandoverCommentResponse update(UUID workspaceId, UUID handoverEntryId, UUID commentId, UpdateHandoverCommentRequest request) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);

        HandoverComment comment = findComment(workspaceId, handoverEntryId, commentId);
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException("Only the author can update this comment.");
        }

        comment.setContent(request.getContent());
        HandoverComment saved = commentRepository.save(comment);
        return commentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID workspaceId, UUID handoverEntryId, UUID commentId) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);

        HandoverComment comment = findComment(workspaceId, handoverEntryId, commentId);
        boolean isAuthor = comment.getAuthor().getId().equals(userId);
        boolean isAdmin = support.isWorkspaceAdminOrOwner(workspaceId, userId);
        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("Only the author or a workspace admin can delete this comment.");
        }

        commentRepository.delete(comment);
        support.addTimelineEvent(comment.getHandoverEntry(), TimelineEventType.UPDATED,
                "A comment was removed", userId);
    }

    // ============================================================================
    // Helpers
    // ============================================================================

    private HandoverEntry findEntry(UUID workspaceId, UUID handoverEntryId) {
        return handoverEntryRepository.findByIdAndWorkspace(handoverEntryId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover not found."));
    }

    private HandoverComment findComment(UUID workspaceId, UUID handoverEntryId, UUID commentId) {
        return commentRepository.findByIdAndHandoverEntryIdAndWorkspaceId(commentId, handoverEntryId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found."));
    }

    private void notifyParticipants(UUID workspaceId, HandoverEntry entry, UUID authorId) {
        boolean notifySender = !entry.getSender().getId().equals(authorId);
        boolean notifyReceiver = !entry.getReceiver().getId().equals(authorId);

        if (notifySender) {
            support.notifyUser(workspaceId, entry.getSender().getId(), Notification.NotificationType.HANDOVER_COMMENTED,
                    "New comment on handover: " + entry.getTitle(), entry.getTitle(), entry.getId());
        }
        if (notifyReceiver) {
            support.notifyUser(workspaceId, entry.getReceiver().getId(), Notification.NotificationType.HANDOVER_COMMENTED,
                    "New comment on handover: " + entry.getTitle(), entry.getTitle(), entry.getId());
        }
    }
}
