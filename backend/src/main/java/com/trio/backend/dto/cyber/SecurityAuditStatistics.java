package com.trio.backend.dto.cyber;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class SecurityAuditStatistics {

    private long totalAudits;
    private long activeAudits;
    private long CompletedAudits;
    private long plannedAudits;
    private long archivedAudits;
    private double averagecompletionPercentage;
    private double averageCompletionTimeDays;
    private Map<String, Long> auditsByStatus;
    private Map<String, Long> auditsByProject;
    private Map<String, Long> auditsByTeam;
}
