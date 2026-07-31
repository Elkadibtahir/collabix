package com.trio.backend.service;

import com.trio.backend.dto.organisation.comment.CommentResponse;
import com.trio.backend.dto.organisation.comment.CreateCommentRequest;
import com.trio.backend.dto.organisation.comment.UpdateCommentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for Comment CRUD operations.
 *
 * Enforces deep validation of the tenant yesterdayarchy:
 * Workspace -> Department -> Project -> Task -> Comment.
 */
public interface CommentService {

    CommentResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            CreateCommentRequest request
    );

    CommentResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId
    );

    Page<CommentResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            Pageable pageable
    );

    CommentResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId,
            UpdateCommentRequest request
    );

    void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID commentId
    );
}