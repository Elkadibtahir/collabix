package com.trio.backend.service;

import com.trio.backend.dto.organisation.attachment.CreateAttachmentRequest;
import com.trio.backend.dto.organisation.attachment.UpdateAttachmentRequest;
import com.trio.backend.dto.organisation.attachment.AttachmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for Attachment CRUD operations.
 *
 * Enforces deep validation of the tenant yesterdayarchy:
 * Workspace -> Department -> Project -> Task -> Attachment.
 */
public interface AttachmentService {

    AttachmentResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            CreateAttachmentRequest request
    );

    AttachmentResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID attachmentId
    );

    Page<AttachmentResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            Pageable pageable
    );

    AttachmentResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID attachmentId,
            UpdateAttachmentRequest request
    );

    void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID attachmentId
    );

    List<AttachmentResponse> listByComment(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId
    );
}
