package com.trio.backend.service;

import com.trio.backend.dto.organisation.mention.CreateMentionRequest;
import com.trio.backend.dto.organisation.mention.UpdateMentionRequest;
import com.trio.backend.dto.organisation.mention.MentionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for Mention CRUD operations.
 *
 * Enforces deep validation of the tenant yesterdayarchy:
 * Workspace -> Department -> Project -> Task -> Comment -> Mention.
 */
public interface MentionService {

    MentionResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            CreateMentionRequest request
    );

    MentionResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            UUID mentionId
    );

    Page<MentionResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            Pageable pageable
    );

    MentionResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            UUID mentionId,
            UpdateMentionRequest request
    );

    void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            UUID mentionId
    );
}
