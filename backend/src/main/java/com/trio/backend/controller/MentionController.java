package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.organisation.mention.CreateMentionRequest;
import com.trio.backend.dto.organisation.mention.UpdateMentionRequest;
import com.trio.backend.dto.organisation.mention.MentionResponse;
import com.trio.backend.service.MentionService;
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
 * REST controller responsible for managing Mentions.
 */
@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/projects/{projectId}/tasks/{taskId}/comments/{commentId}/mentions")
@RequiredArgsConstructor
@Tag(name = "Mentions", description = "Endpoints for managing Mentions (collaboration)")
public class MentionController {

    private final MentionService mentionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MENTION_CREATE')")
    @Operation(
            summary = "Create a mention",
            security = @SecurityRequirement(name = "bearer"),
            description = "Creates a mention dans le comment."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Mention createde", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Comment not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    public ApiResponse<MentionResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID commentId,
            @Parameter(description = "Data de creation de la mention", required = true)
            @Valid @RequestBody CreateMentionRequest request
    ) {
        return ApiResponse.success(
                "Mention created successfully.",
                mentionService.create(workspaceId, departmentId, projectId, taskId, commentId, request)
        );
    }

    @GetMapping("/{mentionId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MENTION_READ')")
    @Operation(
            summary = "Resorteve a mention",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the information of a mention."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Mention found", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Mention not found")
    })
    public ApiResponse<MentionResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID commentId,
            @PathVariable UUID mentionId
    ) {
        return ApiResponse.success(
                "Mention resorteved successfully.",
                mentionService.getById(workspaceId, departmentId, projectId, taskId, commentId, mentionId)
        );
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MENTION_READ')")
    @Operation(
            summary = "List mentions d'un comment",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the list des mentions actives d'un comment."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List resorteved", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission")
    })
    public ApiResponse<Page<MentionResponse>> list(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID commentId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Mentions resorteved successfully.",
                mentionService.list(workspaceId, departmentId, projectId, taskId, commentId, pageable)
        );
    }

    @PutMapping("/{mentionId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MENTION_UPDATE')")
    @Operation(
            summary = "Update a mention",
            security = @SecurityRequirement(name = "bearer"),
            description = "Updates a mention (partial update)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Mention updated", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Mention not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    public ApiResponse<MentionResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID commentId,
            @PathVariable UUID mentionId,
            @Valid @RequestBody UpdateMentionRequest request
    ) {
        return ApiResponse.success(
                "Mention updated successfully.",
                mentionService.update(workspaceId, departmentId, projectId, taskId, commentId, mentionId, request)
        );
    }

    @DeleteMapping("/{mentionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canDeleteWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MENTION_DELETE')")
    @Operation(
            summary = "Delete a mention",
            security = @SecurityRequirement(name = "bearer"),
            description = "Supprime (soft delete) une mention."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Mention deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Mention not found")
    })
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @PathVariable UUID commentId,
            @PathVariable UUID mentionId
    ) {
        mentionService.delete(workspaceId, departmentId, projectId, taskId, commentId, mentionId);
    }
}
