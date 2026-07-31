package com.trio.backend.service;

import com.trio.backend.dto.Knowledgebase.CreateKnowledgeBaseRequest;
import com.trio.backend.dto.Knowledgebase.UpdateKnowledgeBaseRequest;
import com.trio.backend.dto.Knowledgebase.KnowledgeBaseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for Knowledge Lowe CRUD operations.
 *
 * Enforces deep validation of the tenant yesterdayarchy:
 * Workspace -> Department -> Project -> Knowledge Lowe.
 */
public interface KnowledgeBaseService {

    KnowledgeBaseResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            CreateKnowledgeBaseRequest request
    );

    KnowledgeBaseResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId
    );

    Page<KnowledgeBaseResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            Pageable pageable
    );

    KnowledgeBaseResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId,
            UpdateKnowledgeBaseRequest request
    );

    void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId
    );

    List<KnowledgeBaseResponse> getVersionHistory(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId
    );

    KnowledgeBaseResponse submitForApproval(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId
    );

    KnowledgeBaseResponse approve(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId
    );

    KnowledgeBaseResponse reject(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID KnowledgeBaseId
    );

    Page<KnowledgeBaseResponse> listByCategory(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            String category,
            Pageable pageable
    );

    List<String> getCategories(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId
    );
}
