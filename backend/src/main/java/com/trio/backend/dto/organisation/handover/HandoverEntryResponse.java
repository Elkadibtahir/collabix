package com.trio.backend.dto.organisation.handover;

import com.trio.backend.dto.user.UserSummaryResponse;
import com.trio.backend.entity.HandoverEntry;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response CRUD for a HandoverEntry.
 */
@Getter
@Setter
public class HandoverEntryResponse {

    private UUID id;

    private UUID workspaceId;

    private UUID departmentId;

    private UUID projectId;

    private UUID taskId;

    private UserSummaryResponse sender;

    private UserSummaryResponse receiver;

    private String title;

    private String content;

    private HandoverEntry.Priority priority;

    private HandoverEntry.HandoverStatus status;

    private LocalDateTime dueDate;

    private LocalDateTime sentAt;

    private LocalDateTime acceptedAt;

    private LocalDateTime rejectedAt;

    private LocalDateTime completedAt;

    private LocalDateTime archivedAt;

    private Instant createdAt;

    private Instant updatedAt;
}
