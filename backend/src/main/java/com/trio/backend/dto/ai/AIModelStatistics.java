package com.trio.backend.dto.ai;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class AIModelStatistics {

    private long totalModels;
    private long trainingModels;
    private long readyModels;
    private long deployedModels;
    private long archivedModels;
    private double averageAccuracy;
    private Map<String, Long> modelsByStatus;
    private Map<String, Long> modelsByProject;
    private Map<String, Long> modelsByTeam;
}
