package com.trio.backend.dto.organisation.task;

import com.trio.backend.enums.TaskPriority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class CreateTaskRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    @Size(max = 1000)
    private String description;

    private TaskPriority priority;

    private UUID assigneeId;

    private Instant dueAt;

    private Instant startDate;

    private UUID sprintId;

    private UUID securityAuditId;

    private UUID marketingCampaignId;

    @Min(0)
    private Integer storyPoints;
}
