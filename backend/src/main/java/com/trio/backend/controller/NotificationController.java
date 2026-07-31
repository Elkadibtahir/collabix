package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.notification.NotificationResponse;
import com.trio.backend.security.user.CustomUserDetails;
import com.trio.backend.service.NotificationService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller responsible for managing Notifications.
 */
@RestController
@RequestMapping("/api/workspaces/{workspaceId}/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for managing notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{notificationId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'NOTIFICATION_READ')")
    @Operation(
            summary = "Resorteve a notification",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the information of a notification."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification found", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ApiResponse<NotificationResponse> getById(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @Parameter(description = "ID of the notification", required = true)
            @PathVariable UUID notificationId
    ) {
        return ApiResponse.success(
                "Notification resorteved successfully.",
                notificationService.getById(workspaceId, notificationId)
        );
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'NOTIFICATION_READ')")
    @Operation(
            summary = "List notifications of the connected user",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the paginated list of non-archived notifications of the workspace for the authenticated user."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List resorteved", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission")
    })
    public ApiResponse<Page<NotificationResponse>> list(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Notifications resorteved successfully.",
                notificationService.list(workspaceId, currentUser.getId(), pageable)
        );
    }

    @GetMapping("/unread")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'NOTIFICATION_READ')")
    @Operation(
            summary = "List unread notifications",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the paginated list of unread notifications of the workspace for the authenticated user."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List resorteved", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission")
    })
    public ApiResponse<Page<NotificationResponse>> listUnread(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            Pageable pageable
    ) {
        return ApiResponse.success(
                "Unread notifications resorteved successfully.",
                notificationService.listUnread(workspaceId, currentUser.getId(), pageable)
        );
    }

    @GetMapping("/unread/count")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'NOTIFICATION_READ')")
    @Operation(
            summary = "Count unread notifications",
            security = @SecurityRequirement(name = "bearer"),
            description = "Returns the number of unread notifications for the authenticated user in a workspace."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count resorteved", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission")
    })
    public ApiResponse<Long> countUnread(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ApiResponse.success(
                "Unread count resorteved successfully.",
                notificationService.countUnread(workspaceId, currentUser.getId())
        );
    }

    @PutMapping("/{notificationId}/read")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'NOTIFICATION_UPDATE')")
    @Operation(
            summary = "Mark a notification as read",
            security = @SecurityRequirement(name = "bearer"),
            description = "Marks a specific notification as read."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification marked as read", content = @Content(schema = @Schema(implementation = com.trio.backend.common.ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ApiResponse<NotificationResponse> markAsRead(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @Parameter(description = "ID of the notification", required = true)
            @PathVariable UUID notificationId
    ) {
        return ApiResponse.success(
                "Notification marked as read.",
                notificationService.markAsRead(workspaceId, notificationId)
        );
    }

    @PutMapping("/read-all")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'NOTIFICATION_UPDATE')")
    @Operation(
            summary = "Mark all notifications as read",
            security = @SecurityRequirement(name = "bearer"),
            description = "Marks all unread notifications of the authenticated user in a workspace as read."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notifications marked as read"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission")
    })
    public ApiResponse<Void> markAllAsRead(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        notificationService.markAllAsRead(workspaceId, currentUser.getId());
        return ApiResponse.success("All notifications marked as read.");
    }

    @DeleteMapping("/{notificationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canDeleteWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'NOTIFICATION_DELETE')")
    @Operation(
            summary = "Delete a notification",
            security = @SecurityRequirement(name = "bearer"),
            description = "Supprime (soft delete) une notification."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Notification deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User without permission"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public void delete(
            @Parameter(description = "ID of the workspace", required = true)
            @PathVariable UUID workspaceId,
            @Parameter(description = "ID of the notification", required = true)
            @PathVariable UUID notificationId
    ) {
        notificationService.delete(workspaceId, notificationId);
    }
}
