package com.trio.backend.dto.dev;

import com.trio.backend.enums.SprintStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class SprintResponse {

    private UUID id;
    private UUID departmentId;
    private UUID projectId;
    private String projectName;
    private UUID teamId;
    private String teamName;
    private String name;
    private String goal;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private Integer capacity;
    private Double velocity;
    private Integer CompletedStoryPoints;
    private Integer totalStoryPoints;
    private Integer totalTasks;
    private Integer CompletedTasks;
    private Integer remainingTasks;
    private Double completionPercentage;
    private Instant createdAt;
    private Instant updatedAt;
}
