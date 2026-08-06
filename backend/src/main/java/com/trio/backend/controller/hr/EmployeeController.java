package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.CreateEmployeeRequest;
import com.trio.backend.dto.hr.EmployeeResponse;
import com.trio.backend.dto.hr.EmployeeSearchCriteria;
import com.trio.backend.dto.hr.EmployeeStatistics;
import com.trio.backend.dto.hr.EmployeeTimelineEntry;
import com.trio.backend.dto.hr.UpdateEmployeeRequest;
import com.trio.backend.service.hr.EmployeeService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_CREATE')")
    public ApiResponse<EmployeeResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @Valid @RequestBody CreateEmployeeRequest request) {
        return ApiResponse.success("Employee created successfully.",
                employeeService.create(workspaceId, departmentId, request));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_READ')")
    public ApiResponse<EmployeeResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId) {
        return ApiResponse.success("Employee resorteved successfully.",
                employeeService.getById(workspaceId, departmentId, employeeId));
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_READ')")
    public ApiResponse<Page<EmployeeResponse>> list(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            EmployeeSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Employees resorteved successfully.",
                employeeService.list(workspaceId, departmentId, criteria, pageable));
    }

    @PutMapping("/{employeeId}")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_UPDATE')")
    public ApiResponse<EmployeeResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return ApiResponse.success("Employee updated successfully.",
                employeeService.update(workspaceId, departmentId, employeeId, request));
    }

    @DeleteMapping("/{employeeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId) {
        employeeService.delete(workspaceId, departmentId, employeeId);
    }

    @GetMapping("/{employeeId}/timeline")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_READ')")
    public ApiResponse<List<EmployeeTimelineEntry>> getTimeline(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId) {
        return ApiResponse.success("Timeline resorteved successfully.",
                employeeService.getTimeline(workspaceId, departmentId, employeeId));
    }

    @GetMapping("/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_READ')")
    public ApiResponse<EmployeeStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Statistics resorteved successfully.",
                employeeService.getStatistics(workspaceId, departmentId));
    }
}
