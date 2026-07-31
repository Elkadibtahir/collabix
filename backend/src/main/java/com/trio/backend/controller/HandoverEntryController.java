package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.organisation.handover.CreateHandoverEntryRequest;
import com.trio.backend.dto.organisation.handover.HandoverEntryResponse;
import com.trio.backend.dto.organisation.handover.UpdateHandoverEntryRequest;
import com.trio.backend.service.HandoverEntryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

/**
 * REST controller responsible for managing Handover Entries.
 */
@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/projects/{projectId}/handover-entries")
@RequiredArgsConstructor
@Tag(name = "Handover Entries", description = "Endpoints for managing Handover Entries")
public class HandoverEntryController {

    private final HandoverEntryService handoverEntryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_ENTRY_CREATE')")
    @Operation(
            summary = "Create a Handover Entry",
            security = @SecurityRequirement(name = "bearer"),
            description = "Creates a Handover Entry dans the project."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Handover entry createde", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ApiResponse<HandoverEntryResponse> create(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @Parameter(description = "ID of the department", required = true)
            @PathVariable UUID departmentId,
            @Parameter(description = "ID of the project", required = true)
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateHandoverEntryRequest request
    ) {
        return ApiResponse.success(
                "Handover entry created successfully.",
                handoverEntryService.create(workspaceId, departmentId, projectId, request)
        );
    }

    @GetMapping("/{handoverEntryId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_ENTRY_READ')")
    @Operation(
            summary = "Resorteve a Handover Entry",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the information of a Handover Entry."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Handover entry found", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Handover entry not found")
    })
    public ApiResponse<HandoverEntryResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID handoverEntryId
    ) {
        return ApiResponse.success(
                "Handover entry resorteved successfully.",
                handoverEntryService.getById(workspaceId, departmentId, projectId, handoverEntryId)
        );
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_ENTRY_READ')")
    @Operation(
            summary = "List Handover Ensortes of a project",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the list des Handover Ensortes actives of a project."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List resorteved", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission")
    })
    public ApiResponse<Page<HandoverEntryResponse>> list(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Handover ensortes resorteved successfully.",
                handoverEntryService.list(workspaceId, departmentId, projectId, pageable)
        );
    }

    @PutMapping("/{handoverEntryId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_ENTRY_UPDATE')")
    @Operation(
            summary = "Update a Handover Entry",
            security = @SecurityRequirement(name = "bearer"),
            description = "Updates a Handover Entry (partial update)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Handover entry updated", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Handover entry not found")
    })
    public ApiResponse<HandoverEntryResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID handoverEntryId,
            @Valid @RequestBody UpdateHandoverEntryRequest request
    ) {
        return ApiResponse.success(
                "Handover entry updated successfully.",
                handoverEntryService.update(workspaceId, departmentId, projectId, handoverEntryId, request)
        );
    }

    @DeleteMapping("/{handoverEntryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canDeleteWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_ENTRY_DELETE')")
    @Operation(
            summary = "Delete a Handover Entry",
            security = @SecurityRequirement(name = "bearer"),
            description = "Supprime (soft delete) une Handover Entry."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Handover entry deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Handover entry not found")
    })
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID handoverEntryId
    ) {
        handoverEntryService.delete(workspaceId, departmentId, projectId, handoverEntryId);
    }
}

