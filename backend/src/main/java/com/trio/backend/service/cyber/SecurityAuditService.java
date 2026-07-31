package com.trio.backend.service.cyber;

import com.trio.backend.dto.cyber.CreateSecurityAuditRequest;
import com.trio.backend.dto.cyber.SecurityAuditResponse;
import com.trio.backend.dto.cyber.SecurityAuditSearchCriteria;
import com.trio.backend.dto.cyber.SecurityAuditStatistics;
import com.trio.backend.dto.cyber.UpdateSecurityAuditRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SecurityAuditService {

    SecurityAuditResponse create(UUID workspaceId, UUID departmentId, CreateSecurityAuditRequest request);

    SecurityAuditResponse getById(UUID workspaceId, UUID departmentId, UUID auditId);

    Page<SecurityAuditResponse> search(UUID workspaceId, UUID departmentId, SecurityAuditSearchCriteria criteria, Pageable pageable);

    SecurityAuditResponse update(UUID workspaceId, UUID departmentId, UUID auditId, UpdateSecurityAuditRequest request);

    SecurityAuditResponse start(UUID workspaceId, UUID departmentId, UUID auditId);

    SecurityAuditResponse complete(UUID workspaceId, UUID departmentId, UUID auditId);

    SecurityAuditResponse archive(UUID workspaceId, UUID departmentId, UUID auditId);

    SecurityAuditStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
