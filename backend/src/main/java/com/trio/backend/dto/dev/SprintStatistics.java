package com.trio.backend.dto.dev;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class SprintStatistics {

    private long totalSprints;
    private long activeSprints;
    private long CompletedSprints;
    private long plannedSprints;
    private long cancelledSprints;
    private double averageDurationDays;
    private double averageCompletionRate;
    private double averageVelocity;
    private double averageTasksPerSprint;
    private Map<String, Long> sprintsByStatus;
    private Map<String, Long> sprintsByProject;
}
