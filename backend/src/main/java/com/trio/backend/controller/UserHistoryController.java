package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.user.UserHistoryResponse;
import com.trio.backend.dto.user.UserHistorySearchCriteria;
import com.trio.backend.dto.user.UserHistoryStatisticsResponse;
import com.trio.backend.service.UserHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/users/history")
@RequiredArgsConstructor
@Tag(name = "User History", description = "Endpoints for user audit trail and history")
@SecurityRequirement(name = "bearerAuth")
public class UserHistoryController {

    private final UserHistoryService userHistoryService;

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'USER_READ')")
    @Operation(summary = "Search user history with filters and pagination", security = @SecurityRequirement(name = "bearerAuth"))
    public ApiResponse<Page<UserHistoryResponse>> search(
            @PathVariable UUID workspaceId,
            UserHistorySearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success("User history resorteved successfully.", userHistoryService.search(workspaceId, criteria, pageable));
    }

    @GetMapping("/statistics")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'USER_READ')")
    @Operation(summary = "Get user history statistics", security = @SecurityRequirement(name = "bearerAuth"))
    public ApiResponse<UserHistoryStatisticsResponse> statistics(@PathVariable UUID workspaceId) {
        return ApiResponse.success("User history statistics resorteved successfully.", userHistoryService.getStatistics(workspaceId));
    }

}
