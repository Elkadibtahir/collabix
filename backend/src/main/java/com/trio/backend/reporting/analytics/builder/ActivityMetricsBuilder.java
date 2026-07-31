package com.trio.backend.reporting.analytics.builder;

import com.trio.backend.enums.ActivityStatus;
import com.trio.backend.reporting.analytics.dto.metrics.ActivityMetrics;
import com.trio.backend.repository.ActivityRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ActivityMetricsBuilder {

    private final ActivityRepository activityRepository;

    public ActivityMetricsBuilder(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public ActivityMetrics build(UUID workspaceId) {
        long totalCount = activityRepository.countByWorkspaceIdAndStatus(workspaceId, ActivityStatus.ACTIVE);
        return ActivityMetrics.builder()
                .totalCount(totalCount)
                .build();
    }
}
