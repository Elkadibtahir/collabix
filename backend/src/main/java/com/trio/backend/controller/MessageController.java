package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.communication.CreateMessageRequest;
import com.trio.backend.dto.communication.MessageResponse;
import com.trio.backend.dto.communication.UpdateMessageRequest;
import com.trio.backend.service.MessageService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/conversations/{conversationId}/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Endpoints for conversation messages")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_CREATE')")
    @Operation(summary = "Send a message", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<MessageResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID conversationId,
            @Valid @RequestBody CreateMessageRequest request
    ) {
        return ApiResponse.success(
                "Message sent successfully.",
                messageService.create(workspaceId, conversationId, request)
        );
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_READ')")
    @Operation(summary = "List messages in a conversation", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<Page<MessageResponse>> listByConversation(
            @PathVariable UUID workspaceId,
            @PathVariable UUID conversationId,
            @RequestParam(required = false) UUID cursor,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Messages retrieved successfully.",
                messageService.listByConversation(workspaceId, conversationId, cursor, pageable)
        );
    }

    @GetMapping("/pinned")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_READ')")
    @Operation(summary = "List pinned messages", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<List<MessageResponse>> listPinned(
            @PathVariable UUID workspaceId,
            @PathVariable UUID conversationId
    ) {
        return ApiResponse.success(
                "Pinned messages retrieved successfully.",
                messageService.listPinned(workspaceId, conversationId)
        );
    }

    @GetMapping("/files")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_READ')")
    @Operation(summary = "List files in a conversation", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<Page<MessageResponse>> listFiles(
            @PathVariable UUID workspaceId,
            @PathVariable UUID conversationId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Files retrieved successfully.",
                messageService.listFilesByConversation(workspaceId, conversationId, pageable)
        );
    }

    @GetMapping("/search")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_READ')")
    @Operation(summary = "Search messages in a conversation", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<Page<MessageResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID conversationId,
            @RequestParam String query,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Search results retrieved successfully.",
                messageService.search(workspaceId, conversationId, query, pageable)
        );
    }

    @GetMapping("/{messageId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_READ')")
    @Operation(summary = "Get a message by ID", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<MessageResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID messageId
    ) {
        return ApiResponse.success(
                "Message retrieved successfully.",
                messageService.getById(workspaceId, messageId)
        );
    }

    @PutMapping("/{messageId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_UPDATE')")
    @Operation(summary = "Update a message", security = @SecurityRequirement(name = "bearer"))
    public ApiResponse<MessageResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID messageId,
            @Valid @RequestBody UpdateMessageRequest request
    ) {
        return ApiResponse.success(
                "Message updated successfully.",
                messageService.update(workspaceId, messageId, request)
        );
    }

    @DeleteMapping("/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'MESSAGE_DELETE')")
    @Operation(summary = "Delete a message", security = @SecurityRequirement(name = "bearer"))
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID messageId
    ) {
        messageService.delete(workspaceId, messageId);
    }
}
