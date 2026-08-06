package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.EmployeeDocumentResponse;
import com.trio.backend.dto.hr.EmployeeDocumentSearchCriteria;
import com.trio.backend.dto.hr.EmployeeDocumentStatistics;
import com.trio.backend.enums.EmployeeDocumentType;
import com.trio.backend.service.hr.EmployeeDocumentService;
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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}")
@RequiredArgsConstructor
public class EmployeeDocumentController {

    private final EmployeeDocumentService documentService;

    @PostMapping("/employees/{employeeId}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_UPLOAD')")
    public ApiResponse<EmployeeDocumentResponse> upload(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @RequestParam @NotNull MultipartFile file,
            @RequestParam @NotNull EmployeeDocumentType documentType,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) LocalDate expirationDate) {
        return ApiResponse.success("Document uploaded successfully.",
                documentService.upload(workspaceId, departmentId, employeeId, file, title, documentType, description, expirationDate));
    }

    @PutMapping("/employees/{employeeId}/documents/{documentId}")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_UPDATE')")
    public ApiResponse<EmployeeDocumentResponse> replace(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId,
            @RequestParam @NotNull MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) LocalDate expirationDate) {
        return ApiResponse.success("Document replaced successfully.",
                documentService.replace(workspaceId, departmentId, employeeId, documentId, file, title, description, expirationDate));
    }

    @GetMapping("/employees/{employeeId}/documents/{documentId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_READ')")
    public ApiResponse<EmployeeDocumentResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId) {
        return ApiResponse.success("Document resorteved successfully.",
                documentService.getById(workspaceId, departmentId, employeeId, documentId));
    }

    @GetMapping("/employees/{employeeId}/documents")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_READ')")
    public ApiResponse<Page<EmployeeDocumentResponse>> listByEmployee(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Documents resorteved successfully.",
                documentService.listByEmployee(workspaceId, departmentId, employeeId, pageable));
    }

    @GetMapping("/employees/{employeeId}/documents/search")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_READ')")
    public ApiResponse<Page<EmployeeDocumentResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            EmployeeDocumentSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        criteria.setEmployeeId(employeeId);
        return ApiResponse.success("Documents resorteved successfully.",
                documentService.search(workspaceId, departmentId, criteria, pageable));
    }

    @GetMapping("/employees/{employeeId}/documents/{documentId}/download")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_READ')")
    public ResponseEntity<Resource> download(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId) {
        EmployeeDocumentResponse meta = documentService.getById(workspaceId, departmentId, employeeId, documentId);
        Resource resource = documentService.download(workspaceId, departmentId, employeeId, documentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(meta.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + meta.getOriginalFileName() + "\"")
                .body(resource);
    }

    @PutMapping("/employees/{employeeId}/documents/{documentId}/verify")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_VERIFY')")
    public ApiResponse<EmployeeDocumentResponse> verify(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId) {
        return ApiResponse.success("Document verified successfully.",
                documentService.verify(workspaceId, departmentId, employeeId, documentId));
    }

    @DeleteMapping("/employees/{employeeId}/documents/{documentId}/verify")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_VERIFY')")
    public ApiResponse<EmployeeDocumentResponse> unverify(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId) {
        return ApiResponse.success("Document unverified successfully.",
                documentService.unverify(workspaceId, departmentId, employeeId, documentId));
    }

    @DeleteMapping("/employees/{employeeId}/documents/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId) {
        documentService.delete(workspaceId, departmentId, employeeId, documentId);
    }

    @GetMapping("/employees/{employeeId}/documents/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_READ')")
    public ApiResponse<EmployeeDocumentStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId) {
        return ApiResponse.success("Document statistics resorteved successfully.",
                documentService.getStatistics(workspaceId, departmentId, employeeId));
    }

    @GetMapping("/documents/expiring")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'EMPLOYEE_DOCUMENT_READ')")
    public ApiResponse<List<EmployeeDocumentResponse>> getExpiringDocuments(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @RequestParam(defaultValue = "30") int withinDays) {
        return ApiResponse.success("Expiring documents resorteved successfully.",
                documentService.getExpiringDocuments(workspaceId, departmentId, withinDays));
    }
}
