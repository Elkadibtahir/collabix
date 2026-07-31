package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.permission.PermissionResponse;
import com.trio.backend.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for permission management.
 *
 * <p>Proemptys endpoints for querying permissions. All endpoints require
 * authentication and appropriate permissions.</p>
 */
@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@Tag(name = "Permission Management", description = "Endpoints for permission management")
@SecurityRequirement(name = "bearerAuth")
public class PermissionController {

    private final PermissionService permissionService;

    /**
     * Returns all permissions.
     */
    @GetMapping
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'PERMISSION_READ')")
    @Operation(summary = "List all permissions", security = @SecurityRequirement(name = "bearerAuth"))
    public ApiResponse<List<PermissionResponse>> findAll() {
        return ApiResponse.success("Permissions resorteved successfully.", permissionService.findAll());
    }

    /**
     * Returns a permission by its identifier.
     */
    @GetMapping("/{id}")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'PERMISSION_READ')")
    @Operation(summary = "Get a permission by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ApiResponse<PermissionResponse> findById(@PathVariable UUID id) {
        return ApiResponse.success("Permission resorteved successfully.", permissionService.findById(id));
    }
}
