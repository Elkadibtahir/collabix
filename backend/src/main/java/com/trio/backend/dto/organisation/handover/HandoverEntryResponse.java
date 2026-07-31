package com.trio.backend.dto.organisation.handover;


import com.trio.backend.entity.HandoverEntry;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response CRUD pour une HandoverEntry.
 */
@Getter
@Setter
public class HandoverEntryResponse {

    private UUID id;

    private UUID workspaceId;

    private UUID departmentId;

    private UUID projectId;

    private UUID taskId;

    private UUID userId;

    private String workFinished;

    private String workRemaining;

    private String difficulties;

    private String blockers;

    private String importantInformation;

    private String priorities;

    private Long timeSpentMinutes;

    private Boolean needHelp;

    private String additionalNotes;

    private HandoverEntry.Shift shift;

    private LocalDateTime passedAt;

    private HandoverEntry.HandoverEntryStatus status;

    private Instant createdAt;

    private Instant updatedAt;
}

