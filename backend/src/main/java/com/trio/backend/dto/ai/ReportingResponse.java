package com.trio.backend.dto.ai;

import com.trio.backend.entity.ExecutiveReport;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ReportingResponse {

    private UUID reportId;

    private UUID workspaceId;

    private UUID departmentId;

    private UUID projectId;

    private String title;

    private ExecutiveReport.ReportType reportType;

    private LocalDate periodStart;

    private LocalDate periodEnd;

    private Integer reportVersion;

    private String executiveSummary;

    private String majorHighlights;

    private String businessHealth;

    private String productivityReview;

    private String criticalRisks;

    private String achievements;

    private String challenges;

    private String recommendations;

    private String strategicPriorities;

    private String nextActions;

    private String finalReport;

    private ExecutiveReport.GenerationStatus generationStatus;

    private ExecutiveReport.ApprovalStatus approvalStatus;

    private LocalDateTime generationDate;

    private UUID generatedBy;

    private Long executionTime;

    private Instant createdAt;

    private Instant updatedAt;
}
