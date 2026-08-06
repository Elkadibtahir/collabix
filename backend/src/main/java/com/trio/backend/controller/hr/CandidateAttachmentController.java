package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.AttachmentSearchCriteria;
import com.trio.backend.dto.hr.AttachmentStatistics;
import com.trio.backend.dto.hr.CandidateAttachmentResponse;
import com.trio.backend.enums.AttachmentType;
import com.trio.backend.service.hr.CandidateAttachmentService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}")
@RequiredArgsConstructor
public class CandidateAttachmentController {

    private final CandidateAttachmentService attachmentService;

    @PostMapping("/candidates/{candidateId}/attachments")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_ATTACHMENT_UPLOAD')")
    public ApiResponse<CandidateAttachmentResponse> upload(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @RequestParam @NotNull MultipartFile file,
            @RequestParam AttachmentType attachmentType,
            @RequestParam(required = false) String description) {
        return ApiResponse.success("Attachment uploaded successfully.",
                attachmentService.upload(workspaceId, departmentId, candidateId, file, description, attachmentType));
    }

    @PutMapping("/candidates/{candidateId}/attachments/{attachmentId}")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_ATTACHMENT_UPDATE')")
    public ApiResponse<CandidateAttachmentResponse> replace(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @PathVariable UUID attachmentId,
            @RequestParam @NotNull MultipartFile file,
            @RequestParam(required = false) String description) {
        return ApiResponse.success("Attachment replaced successfully.",
                attachmentService.replace(workspaceId, departmentId, candidateId, attachmentId, file, description));
    }

    @GetMapping("/candidates/{candidateId}/attachments/{attachmentId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_ATTACHMENT_READ')")
    public ApiResponse<CandidateAttachmentResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @PathVariable UUID attachmentId) {
        return ApiResponse.success("Attachment resorteved successfully.",
                attachmentService.getById(workspaceId, departmentId, candidateId, attachmentId));
    }

    @GetMapping("/candidates/{candidateId}/attachments")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_ATTACHMENT_READ')")
    public ApiResponse<Page<CandidateAttachmentResponse>> listByCandidate(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Attachments resorteved successfully.",
                attachmentService.listByCandidate(workspaceId, departmentId, candidateId, pageable));
    }

    @GetMapping("/candidates/{candidateId}/attachments/search")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_ATTACHMENT_READ')")
    public ApiResponse<Page<CandidateAttachmentResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            AttachmentSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        criteria.setCandidateId(candidateId);
        return ApiResponse.success("Attachments resorteved successfully.",
                attachmentService.search(workspaceId, departmentId, criteria, pageable));
    }

    @GetMapping("/candidates/{candidateId}/attachments/{attachmentId}/download")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_ATTACHMENT_READ')")
    public ResponseEntity<Resource> download(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @PathVariable UUID attachmentId) {
        CandidateAttachmentResponse meta = attachmentService.getById(workspaceId, departmentId, candidateId, attachmentId);
        Resource resource = attachmentService.download(workspaceId, departmentId, candidateId, attachmentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(meta.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + meta.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/candidates/{candidateId}/attachments/{attachmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_ATTACHMENT_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID candidateId,
            @PathVariable UUID attachmentId) {
        attachmentService.delete(workspaceId, departmentId, candidateId, attachmentId);
    }

    @GetMapping("/attachments/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'CANDIDATE_ATTACHMENT_READ')")
    public ApiResponse<AttachmentStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Attachment statistics resorteved successfully.",
                attachmentService.getStatistics(workspaceId, departmentId));
    }
}
