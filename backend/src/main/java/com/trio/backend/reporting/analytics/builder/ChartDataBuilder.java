package com.trio.backend.reporting.analytics.builder;

import com.trio.backend.reporting.analytics.dto.ChartType;
import com.trio.backend.reporting.analytics.dto.chart.ChartData;
import com.trio.backend.reporting.analytics.dto.chart.ChartPoint;
import com.trio.backend.reporting.analytics.dto.chart.ChartSeries;
import com.trio.backend.reporting.analytics.dto.metrics.TaskMetrics;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class ChartDataBuilder {

    private final TaskMetricsBuilder taskMetricsBuilder;

    public ChartDataBuilder(TaskMetricsBuilder taskMetricsBuilder) {
        this.taskMetricsBuilder = taskMetricsBuilder;
    }

    public List<ChartData> buildTaskCharts(UUID workspaceId) {
        TaskMetrics metrics = taskMetricsBuilder.build(workspaceId);

        ChartData taskDistribution = ChartData.builder()
                .chartId("task-status-distribution")
                .title("Task Status Distribution")
                .type(ChartType.DONUT)
                .series(List.of(
                        ChartSeries.builder()
                                .name("Tasks")
                                .points(List.of(
                                        ChartPoint.builder().label("Active").value(metrics.getActiveCount()).build(),
                                        ChartPoint.builder().label("Archived").value(metrics.getArchivedCount()).build(),
                                        ChartPoint.builder().label("Overdue").value(metrics.getOverdueCount()).build()
                                ))
                                .build()
                ))
                .labels(List.of("Active", "Archived", "Overdue"))
                .build();

        ChartData dueSoon = ChartData.builder()
                .chartId("tasks-due-soon")
                .title("Tasks Due Soon")
                .type(ChartType.BAR)
                .series(List.of(
                        ChartSeries.builder()
                                .name("Count")
                                .points(List.of(
                                        ChartPoint.builder().label("Today").value(metrics.getDueTodayCount()).build(),
                                        ChartPoint.builder().label("This Week").value(metrics.getDueThisWeekCount()).build()
                                ))
                                .build()
                ))
                .labels(List.of("Today", "This Week"))
                .build();

        return List.of(taskDistribution, dueSoon);
    }
}
