package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.notification.NotificationPreferenceRequest;
import com.trio.backend.dto.notification.NotificationPreferenceResponse;
import com.trio.backend.service.NotificationPreferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/notification-preferences")
@RequiredArgsConstructor
@Tag(name = "Notification Preferences", description = "Endpoints for managing notification preferences")
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication)")
    @Operation(
            summary = "Get notification preferences",
            security = @SecurityRequirement(name = "bearer")
    )
    public ApiResponse<List<NotificationPreferenceResponse>> getPreferences(
            @PathVariable UUID workspaceId
    ) {
        return ApiResponse.success(
                "Preferences retrieved successfully.",
                preferenceService.getPreferences(workspaceId)
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication)")
    @Operation(
            summary = "Create a notification preference",
            security = @SecurityRequirement(name = "bearer")
    )
    public ApiResponse<NotificationPreferenceResponse> createPreference(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody NotificationPreferenceRequest request
    ) {
        return ApiResponse.success(
                "Preference created successfully.",
                preferenceService.createPreference(workspaceId, request)
        );
    }

    @PutMapping("/{preferenceId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication)")
    @Operation(
            summary = "Update a notification preference",
            security = @SecurityRequirement(name = "bearer")
    )
    public ApiResponse<NotificationPreferenceResponse> updatePreference(
            @PathVariable UUID workspaceId,
            @PathVariable UUID preferenceId,
            @Valid @RequestBody NotificationPreferenceRequest request
    ) {
        return ApiResponse.success(
                "Preference updated successfully.",
                preferenceService.updatePreference(workspaceId, preferenceId, request)
        );
    }

    @DeleteMapping("/{preferenceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication)")
    @Operation(
            summary = "Delete a notification preference",
            security = @SecurityRequirement(name = "bearer")
    )
    public void deletePreference(
            @PathVariable UUID workspaceId,
            @PathVariable UUID preferenceId
    ) {
        preferenceService.deletePreference(workspaceId, preferenceId);
    }
}
