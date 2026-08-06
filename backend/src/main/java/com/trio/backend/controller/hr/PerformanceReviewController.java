package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.CreatePerformanceReviewRequest;
import com.trio.backend.dto.hr.PerformanceReviewResponse;
import com.trio.backend.dto.hr.PerformanceReviewSearchCriteria;
import com.trio.backend.dto.hr.PerformanceReviewStatistics;
import com.trio.backend.dto.hr.UpdatePerformanceReviewRequest;
import com.trio.backend.service.hr.PerformanceReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/performance-reviews")
@RequiredArgsConstructor
public class PerformanceReviewController {

    private final PerformanceReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_CREATE')")
    public ApiResponse<PerformanceReviewResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @Valid @RequestBody CreatePerformanceReviewRequest request) {
        return ApiResponse.success("Performance review created successfully.",
                reviewService.create(workspaceId, departmentId, request));
    }

    @GetMapping("/{reviewId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_READ')")
    public ApiResponse<PerformanceReviewResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID reviewId) {
        return ApiResponse.success("Performance review resorteved successfully.",
                reviewService.getById(workspaceId, departmentId, reviewId));
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_READ')")
    public ApiResponse<Page<PerformanceReviewResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            PerformanceReviewSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "reviewDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Performance reviews resorteved successfully.",
                reviewService.search(workspaceId, departmentId, criteria, pageable));
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_UPDATE')")
    public ApiResponse<PerformanceReviewResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID reviewId,
            @Valid @RequestBody UpdatePerformanceReviewRequest request) {
        return ApiResponse.success("Performance review updated successfully.",
                reviewService.update(workspaceId, departmentId, reviewId, request));
    }

    @PutMapping("/{reviewId}/submit")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_SUBMIT')")
    public ApiResponse<PerformanceReviewResponse> submit(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID reviewId) {
        return ApiResponse.success("Performance review submitted successfully.",
                reviewService.submit(workspaceId, departmentId, reviewId));
    }

    @PutMapping("/{reviewId}/approve")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_APPROVE')")
    public ApiResponse<PerformanceReviewResponse> approve(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID reviewId) {
        return ApiResponse.success("Performance review approved successfully.",
                reviewService.approve(workspaceId, departmentId, reviewId));
    }

    @PutMapping("/{reviewId}/reject")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_APPROVE')")
    public ApiResponse<PerformanceReviewResponse> reject(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID reviewId,
            @RequestParam String reason) {
        return ApiResponse.success("Performance review rejected.",
                reviewService.reject(workspaceId, departmentId, reviewId, reason));
    }

    @PutMapping("/{reviewId}/archive")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_UPDATE')")
    public ApiResponse<PerformanceReviewResponse> archive(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID reviewId) {
        return ApiResponse.success("Performance review archived successfully.",
                reviewService.archive(workspaceId, departmentId, reviewId));
    }

    @DeleteMapping("/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID reviewId) {
        reviewService.delete(workspaceId, departmentId, reviewId);
    }

    @GetMapping("/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'PERFORMANCE_REVIEW_READ')")
    public ApiResponse<PerformanceReviewStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Performance review statistics resorteved successfully.",
                reviewService.getStatistics(workspaceId, departmentId));
    }
}
