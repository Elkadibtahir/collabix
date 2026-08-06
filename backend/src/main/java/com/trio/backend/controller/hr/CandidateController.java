package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.CandidateResponse;
import com.trio.backend.dto.hr.CandidateSearchCriteria;
import com.trio.backend.dto.hr.CandidateStatistics;
import com.trio.backend.dto.hr.CandidateStatusChangeRequest;
import com.trio.backend.dto.hr.CandidateTimelineEntry;
import com.trio.backend.dto.hr.CreateCandidateRequest;
import com.trio.backend.dto.hr.UpdateCandidateRequest;
import com.trio.backend.service.hr.CandidateService;
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
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_CREATE')")
    public ApiResponse<CandidateResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @Valid @RequestBody CreateCandidateRequest request) {
        return ApiResponse.success("Candidate created successfully.",
                candidateService.create(workspaceId, departmentId, request));
    }

    @GetMapping("/{candidateId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_READ')")
    public ApiResponse<CandidateResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId) {
        return ApiResponse.success("Candidate resorteved successfully.",
                candidateService.getById(workspaceId, departmentId, candidateId));
    }

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_READ')")
    public ApiResponse<Page<CandidateResponse>> list(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            CandidateSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Candidates resorteved successfully.",
                candidateService.list(workspaceId, departmentId, criteria, pageable));
    }

    @PutMapping("/{candidateId}")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_UPDATE')")
    public ApiResponse<CandidateResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @Valid @RequestBody UpdateCandidateRequest request) {
        return ApiResponse.success("Candidate updated successfully.",
                candidateService.update(workspaceId, departmentId, candidateId, request));
    }

    @DeleteMapping("/{candidateId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId) {
        candidateService.delete(workspaceId, departmentId, candidateId);
    }

    @PutMapping("/{candidateId}/status")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_UPDATE')")
    public ApiResponse<CandidateResponse> changeStatus(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @Valid @RequestBody CandidateStatusChangeRequest request) {
        return ApiResponse.success("Candidate status updated successfully.",
                candidateService.changeStatus(workspaceId, departmentId, candidateId, request));
    }

    @GetMapping("/{candidateId}/timeline")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_READ')")
    public ApiResponse<List<CandidateTimelineEntry>> getTimeline(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId) {
        return ApiResponse.success("Timeline resorteved successfully.",
                candidateService.getTimeline(workspaceId, departmentId, candidateId));
    }

    @GetMapping("/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_READ')")
    public ApiResponse<CandidateStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Statistics resorteved successfully.",
                candidateService.getStatistics(workspaceId, departmentId));
    }
}
