package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.CreateHandoverAttachmentRequest;
import com.trio.backend.dto.organisation.handover.HandoverAttachmentResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service for attachments on HandoverEntry.
 */
public interface HandoverAttachmentService {

    List<HandoverAttachmentResponse> list(UUID workspaceId, UUID handoverEntryId);

    HandoverAttachmentResponse create(UUID workspaceId, UUID handoverEntryId, CreateHandoverAttachmentRequest request);

    void delete(UUID workspaceId, UUID handoverEntryId, UUID attachmentId);
}
