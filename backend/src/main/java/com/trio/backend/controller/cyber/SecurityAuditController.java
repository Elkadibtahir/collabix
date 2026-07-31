package com.trio.backend.controller.cyber;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.cyber.CreateSecurityAuditRequest;
import com.trio.backend.dto.cyber.SecurityAuditResponse;
import com.trio.backend.dto.cyber.SecurityAuditSearchCriteria;
import com.trio.backend.dto.cyber.SecurityAuditStatistics;
import com.trio.backend.dto.cyber.UpdateSecurityAuditRequest;
import com.trio.backend.service.cyber.SecurityAuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/audits")
@RequiredArgsConstructor
public class SecurityAuditController {

    private final SecurityAuditService securityAuditService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SECURITY_AUDIT_CREATE')")
    public ApiResponse<SecurityAuditResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @Valid @RequestBody CreateSecurityAuditRequest request) {
        return ApiResponse.success("Security audit created successfully.",
                securityAuditService.create(workspaceId, departmentId, request));
    }

    @GetMapping("/{auditId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SECURITY_AUDIT_READ')")
    public ApiResponse<SecurityAuditResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID auditId) {
        return ApiResponse.success("Security audit resorteved successfully.",
                securityAuditService.getById(workspaceId, departmentId, auditId));
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SECURITY_AUDIT_READ')")
    public ApiResponse<Page<SecurityAuditResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            SecurityAuditSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Security audits resorteved successfully.",
                securityAuditService.search(workspaceId, departmentId, criteria, pageable));
    }

    @PutMapping("/{auditId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SECURITY_AUDIT_UPDATE')")
    public ApiResponse<SecurityAuditResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID auditId,
            @Valid @RequestBody UpdateSecurityAuditRequest request) {
        return ApiResponse.success("Security audit updated successfully.",
                securityAuditService.update(workspaceId, departmentId, auditId, request));
    }

    @PutMapping("/{auditId}/start")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SECURITY_AUDIT_START')")
    public ApiResponse<SecurityAuditResponse> start(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID auditId) {
        return ApiResponse.success("Security audit started successfully.",
                securityAuditService.start(workspaceId, departmentId, auditId));
    }

    @PutMapping("/{auditId}/complete")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SECURITY_AUDIT_COMPLETE')")
    public ApiResponse<SecurityAuditResponse> complete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID auditId) {
        return ApiResponse.success("Security audit completed successfully.",
                securityAuditService.complete(workspaceId, departmentId, auditId));
    }

    @PutMapping("/{auditId}/archive")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SECURITY_AUDIT_ARCHIVE')")
    public ApiResponse<SecurityAuditResponse> archive(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID auditId) {
        return ApiResponse.success("Security audit archived successfully.",
                securityAuditService.archive(workspaceId, departmentId, auditId));
    }

    @GetMapping("/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'SECURITY_AUDIT_READ')")
    public ApiResponse<SecurityAuditStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Security audit statistics resorteved successfully.",
                securityAuditService.getStatistics(workspaceId, departmentId));
    }
}
