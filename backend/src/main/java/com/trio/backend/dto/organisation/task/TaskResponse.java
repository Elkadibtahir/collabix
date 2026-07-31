package com.trio.backend.dto.organisation.task;

import com.trio.backend.enums.TaskPriority;
import com.trio.backend.enums.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class TaskResponse {

    private UUID id;

    private UUID projectId;

    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private UUID assigneeId;

    private String assigneeName;

    private Instant dueAt;

    private Instant startDate;

    private UUID sprintId;

    private UUID securityAuditId;

    private UUID marketingCampaignId;

    private Integer storyPoints;

    private String projectName;

    private String departmentName;

    private Instant createdAt;

    private Instant updatedAt;
}
