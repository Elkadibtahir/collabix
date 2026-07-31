package com.trio.backend.dto.ai;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class HandoverAIEditRequest {

    @NotNull
    private UUID workspaceId;

    @NotNull
    private UUID departmentId;

    @NotNull
    private UUID projectId;

    private String executiveSummary;

    private String completedWork;

    private String pendingWork;

    private String criticalRisks;

    private String blockedTasks;

    private String recommendations;

    private String priorityActions;

    private String workContinuity;
}
