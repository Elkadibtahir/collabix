package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.EmployeeDocumentResponse;
import com.trio.backend.dto.hr.EmployeeDocumentSearchCriteria;
import com.trio.backend.dto.hr.EmployeeDocumentStatistics;
import com.trio.backend.enums.EmployeeDocumentType;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface EmployeeDocumentService {

    EmployeeDocumentResponse upload(UUID workspaceId, UUID departmentId, UUID employeeId,
                                    MultipartFile file, String title, EmployeeDocumentType documentType,
                                    String description, LocalDate expirationDate);

    EmployeeDocumentResponse replace(UUID workspaceId, UUID departmentId, UUID employeeId, UUID documentId,
                                     MultipartFile file, String title, String description, LocalDate expirationDate);

    EmployeeDocumentResponse getById(UUID workspaceId, UUID departmentId, UUID employeeId, UUID documentId);

    Page<EmployeeDocumentResponse> listByEmployee(UUID workspaceId, UUID departmentId, UUID employeeId, Pageable pageable);

    Page<EmployeeDocumentResponse> search(UUID workspaceId, UUID departmentId, EmployeeDocumentSearchCriteria criteria, Pageable pageable);

    Resource download(UUID workspaceId, UUID departmentId, UUID employeeId, UUID documentId);

    EmployeeDocumentResponse verify(UUID workspaceId, UUID departmentId, UUID employeeId, UUID documentId);

    EmployeeDocumentResponse unverify(UUID workspaceId, UUID departmentId, UUID employeeId, UUID documentId);

    void delete(UUID workspaceId, UUID departmentId, UUID employeeId, UUID documentId);

    EmployeeDocumentStatistics getStatistics(UUID workspaceId, UUID departmentId, UUID employeeId);

    List<EmployeeDocumentResponse> getExpiringDocuments(UUID workspaceId, UUID departmentId, int withinDays);
}
