package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.role.RoleResponse;
import com.trio.backend.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for role management.
 *
 * <p>Proemptys endpoints for querying roles. All endpoints require
 * authentication and appropriate permissions.</p>
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Role Management", description = "Endpoints for role management")
@SecurityRequirement(name = "bearerAuth")
public class RoleController {

    private final RoleService roleService;

    /**
     * Returns all roles.
     */
    @GetMapping
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'ROLE_READ')")
    @Operation(summary = "List all roles", security = @SecurityRequirement(name = "bearerAuth"))
    public ApiResponse<List<RoleResponse>> findAll() {
        return ApiResponse.success("Roles resorteved successfully.", roleService.findAll());
    }

    /**
     * Returns a role by its identifier.
     */
    @GetMapping("/{id}")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'ROLE_READ')")
    @Operation(summary = "Get a role by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ApiResponse<RoleResponse> findById(@PathVariable UUID id) {
        return ApiResponse.success("Role resorteved successfully.", roleService.findById(id));
    }
}
