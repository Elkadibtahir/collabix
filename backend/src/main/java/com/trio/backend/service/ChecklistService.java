package com.trio.backend.service;

import com.trio.backend.dto.organisation.checklist.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ChecklistService {

    ChecklistResponse create(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, CreateChecklistRequest request);

    ChecklistResponse getById(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId);

    Page<ChecklistResponse> list(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, Pageable pageable);

    ChecklistResponse update(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, UpdateChecklistRequest request);

    void delete(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId);

    ChecklistItemResponse createItem(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, CreateChecklistItemRequest request);

    ChecklistItemResponse updateItem(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, UUID itemId, UpdateChecklistItemRequest request);

    void deleteItem(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, UUID itemId);

    ChecklistItemResponse toggleItem(UUID workspaceId, UUID departmentId, UUID projectId, UUID taskId, UUID checklistId, UUID itemId);
}
