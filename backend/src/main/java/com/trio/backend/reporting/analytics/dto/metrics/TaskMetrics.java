package com.trio.backend.reporting.analytics.dto.metrics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskMetrics {

    private long activeCount;
    private long archivedCount;
    private long overdueCount;
    private long dueTodayCount;
    private long dueThisWeekCount;
    private double completionRate;
    private double velocity;
}
