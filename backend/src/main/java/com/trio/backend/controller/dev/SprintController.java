package com.trio.backend.controller.dev;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.dev.CreateSprintRequest;
import com.trio.backend.dto.dev.SprintResponse;
import com.trio.backend.dto.dev.SprintSearchCriteria;
import com.trio.backend.dto.dev.SprintStatistics;
import com.trio.backend.dto.dev.UpdateSprintRequest;
import com.trio.backend.service.dev.SprintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SPRINT_CREATE')")
    public ApiResponse<SprintResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @Valid @RequestBody CreateSprintRequest request) {
        return ApiResponse.success("Sprint created successfully.",
                sprintService.create(workspaceId, departmentId, request));
    }

    @GetMapping("/{sprintId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SPRINT_READ')")
    public ApiResponse<SprintResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID sprintId) {
        return ApiResponse.success("Sprint resorteved successfully.",
                sprintService.getById(workspaceId, departmentId, sprintId));
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SPRINT_READ')")
    public ApiResponse<Page<SprintResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            SprintSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Sprints resorteved successfully.",
                sprintService.search(workspaceId, departmentId, criteria, pageable));
    }

    @PutMapping("/{sprintId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SPRINT_UPDATE')")
    public ApiResponse<SprintResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID sprintId,
            @Valid @RequestBody UpdateSprintRequest request) {
        return ApiResponse.success("Sprint updated successfully.",
                sprintService.update(workspaceId, departmentId, sprintId, request));
    }

    @PutMapping("/{sprintId}/activate")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SPRINT_ACTIVATE')")
    public ApiResponse<SprintResponse> activate(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID sprintId) {
        return ApiResponse.success("Sprint activated successfully.",
                sprintService.activate(workspaceId, departmentId, sprintId));
    }

    @PutMapping("/{sprintId}/complete")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SPRINT_COMPLETE')")
    public ApiResponse<SprintResponse> complete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID sprintId) {
        return ApiResponse.success("Sprint completed successfully.",
                sprintService.complete(workspaceId, departmentId, sprintId));
    }

    @PutMapping("/{sprintId}/archive")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SPRINT_ARCHIVE')")
    public ApiResponse<SprintResponse> archive(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID sprintId) {
        return ApiResponse.success("Sprint archived successfully.",
                sprintService.archive(workspaceId, departmentId, sprintId));
    }

    @DeleteMapping("/{sprintId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SPRINT_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID sprintId) {
        sprintService.delete(workspaceId, departmentId, sprintId);
    }

    @GetMapping("/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SPRINT_READ')")
    public ApiResponse<SprintStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Sprint statistics resorteved successfully.",
                sprintService.getStatistics(workspaceId, departmentId));
    }
}
