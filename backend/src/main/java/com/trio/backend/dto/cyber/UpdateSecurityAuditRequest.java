package com.trio.backend.dto.cyber;

import com.trio.backend.enums.AuditPriority;
import com.trio.backend.enums.AuditType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class UpdateSecurityAuditRequest {

    private UUID teamId;
    private String name;
    private String description;
    private AuditType auditType;
    private AuditPriority priority;
    private LocalDate startDate;
    private LocalDate endDate;
}
