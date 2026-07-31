package com.trio.backend.dto.cyber;

import com.trio.backend.enums.AuditPriority;
import com.trio.backend.enums.AuditStatus;
import com.trio.backend.enums.AuditType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class SecurityAuditSearchCriteria {

    private UUID projectId;
    private UUID teamId;
    private AuditStatus status;
    private AuditType auditType;
    private AuditPriority priority;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private String keyword;
}
