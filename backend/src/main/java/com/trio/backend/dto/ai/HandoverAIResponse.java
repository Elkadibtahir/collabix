package com.trio.backend.dto.ai;

import com.trio.backend.entity.HandoverJournal;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class HandoverAIResponse {

    private UUID journalId;

    private UUID workspaceId;

    private UUID departmentId;

    private UUID projectId;

    private HandoverJournal.Shift shift;

    private LocalDateTime journalDate;

    private String executiveSummary;

    private String completedWork;

    private String pendingWork;

    private String criticalRisks;

    private String blockedTasks;

    private String recommendations;

    private String priorityActions;

    private String workContinuity;

    private HandoverJournal.GenerationStatus generationStatus;

    private LocalDateTime generationDate;

    private UUID generatedBy;

    private Long executionTime;

    private Instant createdAt;

    private Instant updatedAt;
}
