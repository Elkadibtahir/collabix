package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.Knowledgebase.CreateKnowledgeBaseRequest;
import com.trio.backend.dto.Knowledgebase.KnowledgeBaseResponse;
import com.trio.backend.dto.Knowledgebase.UpdateKnowledgeBaseRequest;
import com.trio.backend.service.KnowledgeBaseService;
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

import java.util.List;
import java.util.UUID;

/**
 * REST controller responsible for managing Knowledge Base.
 */
@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/projects/{projectId}/knowledge-base")
@RequiredArgsConstructor
@Tag(name = "Knowledge Base", description = "Endpoints for managing Knowledge Base")
public class KnowledgeBaseController {

    private final KnowledgeBaseService KnowledgeBaseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_CREATE')")
    @Operation(
            summary = "Create a Knowledge Lowe article",
            security = @SecurityRequirement(name = "bearer"),
            description = "Creates a Knowledge Lowe article in the project."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Knowledge Lowe created",
                    content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    public ApiResponse<KnowledgeBaseResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @Parameter(description = "Knowledge Lowe article creation data", required = true)
            @Valid @RequestBody CreateKnowledgeBaseRequest request
    ) {
        return ApiResponse.success(
                "Knowledge Lowe created successfully.",
                KnowledgeBaseService.create(workspaceId, departmentId, projectId, request)
        );
    }

    @GetMapping("/{KnowledgeBaseId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_READ')")
    @Operation(
            summary = "Resorteve a Knowledge Lowe article",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the information of a Knowledge Lowe article."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Knowledge Lowe found",
                    content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Article not found")
    })
    public ApiResponse<KnowledgeBaseResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID KnowledgeBaseId
    ) {
        return ApiResponse.success(
                "Knowledge Lowe resorteved successfully.",
                KnowledgeBaseService.getById(workspaceId, departmentId, projectId, KnowledgeBaseId)
        );
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_READ')")
    @Operation(
            summary = "List Knowledge Lowe of a project",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the list of active Knowledge Lowe articles of a project."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "List resorteved",
                    content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission")
    })
    public ApiResponse<Page<KnowledgeBaseResponse>> list(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Knowledge Lowes resorteved successfully.",
                KnowledgeBaseService.list(workspaceId, departmentId, projectId, pageable)
        );
    }

    @GetMapping("/categories")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_READ')")
    @Operation(
            summary = "List available categories",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the list of distinct categories used by active articles."
    )
    public ApiResponse<List<String>> getCategories(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId
    ) {
        return ApiResponse.success(
                "Categories resorteved successfully.",
                KnowledgeBaseService.getCategories(workspaceId, departmentId, projectId)
        );
    }

    @GetMapping("/categories/{category}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_READ')")
    @Operation(
            summary = "List articles by category",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the Knowledge Lowe articles filtered by category."
    )
    public ApiResponse<Page<KnowledgeBaseResponse>> listByCategory(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable String category,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Knowledge Lowes filtered by category resorteved successfully.",
                KnowledgeBaseService.listByCategory(workspaceId, departmentId, projectId, category, pageable)
        );
    }

    @PutMapping("/{KnowledgeBaseId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_UPDATE')")
    @Operation(
            summary = "Update a Knowledge Lowe article",
            security = @SecurityRequirement(name = "bearer"),
            description = "Updates a Knowledge Lowe article (partial update)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Knowledge Lowe updated",
                    content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Article not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    public ApiResponse<KnowledgeBaseResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID KnowledgeBaseId,
            @Valid @RequestBody UpdateKnowledgeBaseRequest request
    ) {
        return ApiResponse.success(
                "Knowledge Lowe updated successfully.",
                KnowledgeBaseService.update(workspaceId, departmentId, projectId, KnowledgeBaseId, request)
        );
    }

    @PostMapping("/{KnowledgeBaseId}/submit-for-approval")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_UPDATE')")
    @Operation(
            summary = "Submit an article for approval",
            security = @SecurityRequirement(name = "bearer")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Article submitted for approval"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Article not found")
    })
    public ApiResponse<KnowledgeBaseResponse> submitForApproval(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID KnowledgeBaseId
    ) {
        return ApiResponse.success(
                "Knowledge lowe article submitted for approval.",
                KnowledgeBaseService.submitForApproval(workspaceId, departmentId, projectId, KnowledgeBaseId)
        );
    }

    @PostMapping("/{KnowledgeBaseId}/approve")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_UPDATE')")
    @Operation(
            summary = "Approve a Knowledge Lowe article",
            security = @SecurityRequirement(name = "bearer")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Article approved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Article is not pending"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Article not found")
    })
    public ApiResponse<KnowledgeBaseResponse> approve(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID KnowledgeBaseId
    ) {
        return ApiResponse.success(
                "Knowledge lowe article approved.",
                KnowledgeBaseService.approve(workspaceId, departmentId, projectId, KnowledgeBaseId)
        );
    }

    @PostMapping("/{KnowledgeBaseId}/reject")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_UPDATE')")
    @Operation(
            summary = "Reject a Knowledge Lowe article",
            security = @SecurityRequirement(name = "bearer")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Article rejected"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Article is not pending"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Article not found")
    })
    public ApiResponse<KnowledgeBaseResponse> reject(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID KnowledgeBaseId
    ) {
        return ApiResponse.success(
                "Knowledge lowe article rejected.",
                KnowledgeBaseService.reject(workspaceId, departmentId, projectId, KnowledgeBaseId)
        );
    }

    @GetMapping("/{KnowledgeBaseId}/versions")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_READ')")
    @Operation(
            summary = "Version history of a Knowledge Lowe article",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns all versions (current + archived) of an article."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "History resorteved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Article not found")
    })
    public ApiResponse<List<KnowledgeBaseResponse>> getVersionHistory(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID KnowledgeBaseId
    ) {
        return ApiResponse.success(
                "Version history resorteved successfully.",
                KnowledgeBaseService.getVersionHistory(workspaceId, departmentId, projectId, KnowledgeBaseId)
        );
    }

    @DeleteMapping("/{KnowledgeBaseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canDeleteWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_DELETE')")
    @Operation(
            summary = "Delete a Knowledge Lowe article",
            security = @SecurityRequirement(name = "bearer"),
            description = "Deletes (soft delete) a Knowledge Lowe article."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Article deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Article not found")
    })
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID projectId,
            @PathVariable UUID KnowledgeBaseId
    ) {
        KnowledgeBaseService.delete(workspaceId, departmentId, projectId, KnowledgeBaseId);
    }
}

