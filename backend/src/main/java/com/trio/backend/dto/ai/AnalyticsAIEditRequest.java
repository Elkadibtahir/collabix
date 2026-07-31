package com.trio.backend.dto.ai;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AnalyticsAIEditRequest {

    @NotNull
    private UUID workspaceId;

    @NotNull
    private UUID departmentId;

    private UUID projectId;

    private String executiveSummary;

    private String kpiHighlights;

    private String trendsSummary;

    private String riskAssessment;

    private String recommendations;

    private String detailedReport;
}
