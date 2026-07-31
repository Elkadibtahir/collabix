package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.organisation.checklist.*;
import com.trio.backend.service.ChecklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/projects/{projectId}/tasks/{taskId}/checklists")
@RequiredArgsConstructor
@Tag(name = "Checklists", description = "Endpoints for managing Checklists and Checklist Items")
public class ChecklistController {

    private final ChecklistService checklistService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TASK_UPDATE')")
    @Operation(summary = "Create a checklist", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<ChecklistResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @Valid @RequestBody CreateChecklistRequest request
    ) {
        return ApiResponse.success("Checklist created successfully.", checklistService.create(workspaceId, departmentId, projectId, taskId, request));
    }

    @GetMapping("/{checklistId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication)")
    @Operation(summary = "Get a checklist", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<ChecklistResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID checklistId
    ) {
        return ApiResponse.success("Checklist retrieved successfully.", checklistService.getById(workspaceId, departmentId, projectId, taskId, checklistId));
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication)")
    @Operation(summary = "List checklists", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<Page<ChecklistResponse>> list(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            Pageable pageable
    ) {
        return ApiResponse.success("Checklists retrieved successfully.", checklistService.list(workspaceId, departmentId, projectId, taskId, pageable));
    }

    @PutMapping("/{checklistId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TASK_UPDATE')")
    @Operation(summary = "Update a checklist", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<ChecklistResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID checklistId,
            @Valid @RequestBody UpdateChecklistRequest request
    ) {
        return ApiResponse.success("Checklist updated successfully.", checklistService.update(workspaceId, departmentId, projectId, taskId, checklistId, request));
    }

    @DeleteMapping("/{checklistId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canDeleteWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TASK_DELETE')")
    @Operation(summary = "Delete a checklist", security = @SecurityRequirement(name = "bearer"))
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID checklistId
    ) {
        checklistService.delete(workspaceId, departmentId, projectId, taskId, checklistId);
    }

    @PostMapping("/{checklistId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TASK_UPDATE')")
    @Operation(summary = "Create a checklist item", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<ChecklistItemResponse> createItem(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID checklistId,
            @Valid @RequestBody CreateChecklistItemRequest request
    ) {
        return ApiResponse.success("Checklist item created successfully.", checklistService.createItem(workspaceId, departmentId, projectId, taskId, checklistId, request));
    }

    @PutMapping("/{checklistId}/items/{itemId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TASK_UPDATE')")
    @Operation(summary = "Update a checklist item", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<ChecklistItemResponse> updateItem(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID checklistId,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateChecklistItemRequest request
    ) {
        return ApiResponse.success("Checklist item updated successfully.", checklistService.updateItem(workspaceId, departmentId, projectId, taskId, checklistId, itemId, request));
    }

    @PutMapping("/{checklistId}/items/{itemId}/toggle")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TASK_UPDATE')")
    @Operation(summary = "Toggle a checklist item", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<ChecklistItemResponse> toggleItem(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID checklistId,
            @PathVariable UUID itemId
    ) {
        return ApiResponse.success("Checklist item toggled successfully.", checklistService.toggleItem(workspaceId, departmentId, projectId, taskId, checklistId, itemId));
    }

    @DeleteMapping("/{checklistId}/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canDeleteWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'TASK_DELETE')")
    @Operation(summary = "Delete a checklist item", security = @SecurityRequirement(name = "bearer"))
    public void deleteItem(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID checklistId,
            @PathVariable UUID itemId
    ) {
        checklistService.deleteItem(workspaceId, departmentId, projectId, taskId, checklistId, itemId);
    }
}
