package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.CreateHandoverAttachmentRequest;
import com.trio.backend.dto.organisation.handover.HandoverAttachmentResponse;
import com.trio.backend.entity.HandoverAttachment;
import com.trio.backend.entity.HandoverEntry;
import com.trio.backend.entity.HandoverTimelineEvent.TimelineEventType;
import com.trio.backend.entity.User;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.HandoverAttachmentMapper;
import com.trio.backend.repository.HandoverAttachmentRepository;
import com.trio.backend.repository.HandoverEntryRepository;
import com.trio.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Implementation for attachments on HandoverEntry.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class HandoverAttachmentServiceImpl implements HandoverAttachmentService {

    private final HandoverAttachmentRepository attachmentRepository;
    private final HandoverEntryRepository handoverEntryRepository;
    private final UserRepository userRepository;
    private final HandoverAttachmentMapper attachmentMapper;
    private final HandoverSupport support;

    @Override
    @Transactional(readOnly = true)
    public List<HandoverAttachmentResponse> list(UUID workspaceId, UUID handoverEntryId) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);
        findEntry(workspaceId, handoverEntryId);
        return attachmentRepository.findByHandoverEntryIdAndWorkspaceId(handoverEntryId, workspaceId).stream()
                .map(attachmentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public HandoverAttachmentResponse create(UUID workspaceId, UUID handoverEntryId, CreateHandoverAttachmentRequest request) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);

        HandoverEntry entry = findEntry(workspaceId, handoverEntryId);
        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        HandoverAttachment attachment = attachmentMapper.toEntity(request);
        attachment.setHandoverEntry(entry);
        attachment.setUploadedBy(uploader);
        HandoverAttachment saved = attachmentRepository.save(attachment);

        support.addTimelineEvent(entry, TimelineEventType.ATTACHMENT_ADDED,
                "Attachment added: " + saved.getFileName(), userId);

        return attachmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID workspaceId, UUID handoverEntryId, UUID attachmentId) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);

        HandoverAttachment attachment = attachmentRepository
                .findByIdAndHandoverEntryIdAndWorkspaceId(attachmentId, handoverEntryId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found."));

        HandoverEntry entry = attachment.getHandoverEntry();
        boolean participant = entry.getSender().getId().equals(userId) || entry.getReceiver().getId().equals(userId);
        boolean isAdmin = support.isWorkspaceAdminOrOwner(workspaceId, userId);
        if (!participant && !isAdmin) {
            throw new ForbiddenException("Only the sender, receiver or a workspace admin can remove this attachment.");
        }

        String fileName = attachment.getFileName();
        attachmentRepository.delete(attachment);
        support.addTimelineEvent(entry, TimelineEventType.ATTACHMENT_REMOVED,
                "Attachment removed: " + fileName, userId);
    }

    // ============================================================================
    // Helpers
    // ============================================================================

    private HandoverEntry findEntry(UUID workspaceId, UUID handoverEntryId) {
        return handoverEntryRepository.findByIdAndWorkspace(handoverEntryId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover not found."));
    }
}
