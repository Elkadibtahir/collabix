package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.CreateEmployeeSkillRequest;
import com.trio.backend.dto.hr.EmployeeSkillResponse;
import com.trio.backend.dto.hr.EmployeeSkillSearchCriteria;
import com.trio.backend.dto.hr.EmployeeSkillStatistics;
import com.trio.backend.dto.hr.UpdateEmployeeSkillRequest;
import com.trio.backend.service.hr.EmployeeSkillService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}")
@RequiredArgsConstructor
public class EmployeeSkillController {

    private final EmployeeSkillService skillService;

    @PostMapping("/employees/{employeeId}/skills")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_CREATE')")
    public ApiResponse<EmployeeSkillResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @Valid @RequestBody CreateEmployeeSkillRequest request) {
        return ApiResponse.success("Skill created successfully.",
                skillService.create(workspaceId, departmentId, employeeId, request));
    }

    @GetMapping("/employees/{employeeId}/skills/{skillId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_READ')")
    public ApiResponse<EmployeeSkillResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID skillId) {
        return ApiResponse.success("Skill resorteved successfully.",
                skillService.getById(workspaceId, departmentId, employeeId, skillId));
    }

    @GetMapping("/employees/{employeeId}/skills")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_READ')")
    public ApiResponse<Page<EmployeeSkillResponse>> listByEmployee(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Skills resorteved successfully.",
                skillService.listByEmployee(workspaceId, departmentId, employeeId, pageable));
    }

    @GetMapping("/employees/{employeeId}/skills/search")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_READ')")
    public ApiResponse<Page<EmployeeSkillResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            EmployeeSkillSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        criteria.setEmployeeId(employeeId);
        return ApiResponse.success("Skills resorteved successfully.",
                skillService.search(workspaceId, departmentId, criteria, pageable));
    }

    @PutMapping("/employees/{employeeId}/skills/{skillId}")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_UPDATE')")
    public ApiResponse<EmployeeSkillResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID skillId,
            @Valid @RequestBody UpdateEmployeeSkillRequest request) {
        return ApiResponse.success("Skill updated successfully.",
                skillService.update(workspaceId, departmentId, employeeId, skillId, request));
    }

    @DeleteMapping("/employees/{employeeId}/skills/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID skillId) {
        skillService.delete(workspaceId, departmentId, employeeId, skillId);
    }

    @PutMapping("/employees/{employeeId}/skills/{skillId}/verify")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_UPDATE')")
    public ApiResponse<EmployeeSkillResponse> verify(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID skillId) {
        return ApiResponse.success("Skill verified successfully.",
                skillService.verify(workspaceId, departmentId, employeeId, skillId));
    }

    @DeleteMapping("/employees/{employeeId}/skills/{skillId}/verify")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_DELETE')")
    public ApiResponse<EmployeeSkillResponse> unverify(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID skillId) {
        return ApiResponse.success("Skill unverified successfully.",
                skillService.unverify(workspaceId, departmentId, employeeId, skillId));
    }

    @GetMapping("/skills/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_READ')")
    public ApiResponse<EmployeeSkillStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Skill statistics resorteved successfully.",
                skillService.getStatistics(workspaceId, departmentId));
    }

    @GetMapping("/skills/expiring-certifications")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_SKILL_READ')")
    public ApiResponse<List<EmployeeSkillResponse>> getExpiringCertifications(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @RequestParam(defaultValue = "30") int withinDays) {
        return ApiResponse.success("Expiring certifications resorteved successfully.",
                skillService.getExpiringCertifications(workspaceId, departmentId, withinDays));
    }
}
