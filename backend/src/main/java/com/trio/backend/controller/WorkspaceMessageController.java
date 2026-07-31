package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.communication.MessageResponse;
import com.trio.backend.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Workspace-level message operations")
public class WorkspaceMessageController {

    private final MessageService messageService;

    @GetMapping("/search")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_READ')")
    @Operation(summary = "Search messages across workspace", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<Page<MessageResponse>> search(
            @PathVariable UUID workspaceId,
            @RequestParam String query,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Search results retrieved successfully.",
                messageService.searchByWorkspace(workspaceId, query, pageable)
        );
    }

    @GetMapping("/files")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_READ')")
    @Operation(summary = "List files across workspace", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<Page<MessageResponse>> listFiles(
            @PathVariable UUID workspaceId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Files retrieved successfully.",
                messageService.listFilesByWorkspace(workspaceId, pageable)
        );
    }

    @GetMapping("/my-messages")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_READ')")
    @Operation(summary = "List my messages", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<Page<MessageResponse>> listMyMessages(
            @PathVariable UUID workspaceId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Messages retrieved successfully.",
                messageService.listBySender(workspaceId, pageable)
        );
    }
}
