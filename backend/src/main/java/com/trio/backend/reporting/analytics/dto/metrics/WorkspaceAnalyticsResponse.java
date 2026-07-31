package com.trio.backend.reporting.analytics.dto.metrics;

import com.trio.backend.reporting.analytics.dto.chart.ChartData;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceAnalyticsResponse {

    private TaskMetrics tasks;
    private ActivityMetrics activities;
    private DocumentMetrics documents;
    private NotificationMetrics notifications;
    private long commentCount;
    private long memberCount;
    private long projectCount;
    private List<ChartData> charts;
}
