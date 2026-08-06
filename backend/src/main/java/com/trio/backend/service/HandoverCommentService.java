package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.CreateHandoverCommentRequest;
import com.trio.backend.dto.organisation.handover.HandoverCommentResponse;
import com.trio.backend.dto.organisation.handover.UpdateHandoverCommentRequest;

import java.util.List;
import java.util.UUID;

/**
 * Service for comments on HandoverEntry.
 */
public interface HandoverCommentService {

    List<HandoverCommentResponse> list(UUID workspaceId, UUID handoverEntryId);

    HandoverCommentResponse create(UUID workspaceId, UUID handoverEntryId, CreateHandoverCommentRequest request);

    HandoverCommentResponse update(UUID workspaceId, UUID handoverEntryId, UUID commentId, UpdateHandoverCommentRequest request);

    void delete(UUID workspaceId, UUID handoverEntryId, UUID commentId);
}
