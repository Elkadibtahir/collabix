package com.trio.backend.dto.cyber;

import com.trio.backend.enums.AuditPriority;
import com.trio.backend.enums.AuditStatus;
import com.trio.backend.enums.AuditType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class SecurityAuditResponse {

    private UUID id;
    private UUID departmentId;
    private UUID projectId;
    private String projectName;
    private UUID teamId;
    private String teamName;
    private String name;
    private String description;
    private AuditType auditType;
    private AuditStatus status;
    private AuditPriority priority;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate CompletedAt;
    private Integer totalTasks;
    private Integer CompletedTasks;
    private Integer remainingTasks;
    private Double completionPercentage;
    private Instant createdAt;
    private Instant updatedAt;
}
