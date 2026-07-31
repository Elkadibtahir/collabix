package com.trio.backend.service;

import com.trio.backend.dto.Document.CreateDocumentRequest;
import com.trio.backend.dto.Document.UpdateDocumentRequest;
import com.trio.backend.dto.Document.DocumentResponse;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for Document CRUD operations.
 *
 * Enforces deep validation of the tenant hierarchy:
 * Workspace -> Department -> Project -> Document.
 */
public interface DocumentService {

    DocumentResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            CreateDocumentRequest request
    );

    DocumentResponse upload(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            String title,
            String description,
            String category,
            String tags,
            MultipartFile file
    );

    DocumentResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId
    );

    Page<DocumentResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            Pageable pageable
    );

    Page<DocumentResponse> listByWorkspace(
            UUID workspaceId,
            Pageable pageable
    );

    Page<DocumentResponse> search(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            String query,
            Pageable pageable
    );

    Resource download(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId
    );

    DocumentResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId,
            UpdateDocumentRequest request
    );

    void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId
    );

    DocumentResponse archive(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId
    );

    DocumentResponse restore(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId
    );

    List<DocumentResponse> getVersionHistory(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId
    );

    DocumentResponse submitForApproval(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId
    );

    DocumentResponse approve(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId
    );

    DocumentResponse reject(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID documentId
    );
}
