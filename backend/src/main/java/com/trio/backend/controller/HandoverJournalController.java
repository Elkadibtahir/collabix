package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.organisation.handover.HandoverJournalResponse;
import com.trio.backend.service.HandoverJournalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for automated Handover Journals.
 *
 * <p>REST ssortct rules applied:</p>
 * <ul>
 *     <li>No manual creation (POST /) is allowed.</li>
 *     <li>Actions are modeled as sub-resources (POST /generate, PUT /regenerate).</li>
 *     <li>Ssortct Workspace Authorization yesterdayarchy is enforced through {@code @workspaceAuth}.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/projects/{projectId}/handover-logs")
@RequiredArgsConstructor
@Tag(name = "Handover Journals", description = "Automated Handover Journal Operations API")
public class HandoverJournalController {

    private final HandoverJournalService handoverJournalService;

    @Operation(
            summary = "GÃƒÂ©nÃƒÂ©rer a new log handover ÃƒÂ  partir des inputs actives",
            security = @SecurityRequirement(name = "bearer"),
            description = "Generates a new log handover pour the project specified."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Handover log created",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @PostMapping("/generate")
    @PreAuthorize("@workspaceAuth.canCreateArtifact(#workspaceId, #departmentId, #projectId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_CREATE')")
    public ApiResponse<HandoverJournalResponse> generateJournal(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @Parameter(description = "ID of the department", required = true)
            @PathVariable UUID departmentId,
            @Parameter(description = "ID of the project", required = true)
            @PathVariable UUID projectId) {

        return ApiResponse.success(
                "Handover log generated successfully.",
                handoverJournalService.generateJournal(workspaceId, departmentId, projectId)
        );
    }

    @Operation(
            summary = "List logs handover of a project",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the list paginatede des logs handover actives of a project."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "List resorteved",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission")
    })
    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_READ')")
    public ApiResponse<Page<HandoverJournalResponse>> listJournals(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @Parameter(description = "ID of the department", required = true)
            @PathVariable UUID departmentId,
            @Parameter(description = "ID of the project", required = true)
            @PathVariable UUID projectId,
            Pageable pageable) {

        return ApiResponse.success(
                "Handover logs resorteved successfully.",
                handoverJournalService.list(workspaceId, departmentId, projectId, pageable)
        );
    }

    @Operation(
            summary = "Consulter un log handover specific",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the information d'un log handover."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Handover log found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Handover log not found")
    })
    @GetMapping("/{handoverJournalId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_READ')")
    public ApiResponse<HandoverJournalResponse> getJournalById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID handoverJournalId) {

        return ApiResponse.success(
                "Handover log resorteved successfully.",
                handoverJournalService.getById(workspaceId, departmentId, projectId, handoverJournalId)
        );
    }

    @Operation(
            summary = "RÃƒÂ©generate un log handover existant avec the data currents",
            security = @SecurityRequirement(name = "bearer"),
            description = "Updates a log handover existant avec the data currents des inputs."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Handover log rÃƒÂ©generated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Handover log not found")
    })
    @PutMapping("/{handoverJournalId}/regenerate")
    @PreAuthorize("@workspaceAuth.canCreateArtifact(#workspaceId, #departmentId, #projectId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_UPDATE')")
    public ApiResponse<HandoverJournalResponse> regenerateJournal(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID handoverJournalId) {

        return ApiResponse.success(
                "Handover log regenerated successfully.",
                handoverJournalService.regenerate(workspaceId, departmentId, projectId, handoverJournalId)
        );
    }

    @Operation(
            summary = "Delete logicalment un log handover (Soft Delete)",
            security = @SecurityRequirement(name = "bearer"),
            description = "Supprime (soft delete) un log handover."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Handover log deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Handover log not found")
    })
    @DeleteMapping("/{handoverJournalId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canCreateArtifact(#workspaceId, #departmentId, #projectId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HANDOVER_DELETE')")
    public void deleteJournal(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID handoverJournalId) {

        handoverJournalService.delete(workspaceId, departmentId, projectId, handoverJournalId);
    }
}
