package com.trio.backend.dto.ai;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ReportingEditRequest {

    @NotNull
    private UUID workspaceId;

    @NotNull
    private UUID departmentId;

    private UUID projectId;

    private String title;

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
}
