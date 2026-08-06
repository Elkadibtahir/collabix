package com.trio.backend.reporting.analytics.builder;

import com.trio.backend.enums.TaskStatus;
import com.trio.backend.reporting.analytics.dto.metrics.TaskMetrics;
import com.trio.backend.repository.TaskRepository;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.UUID;

@Component
public class TaskMetricsBuilder {

    private final TaskRepository taskRepository;

    public TaskMetricsBuilder(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskMetrics build(UUID workspaceId) {
        Instant now = Instant.now();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        long activeCount = taskRepository.countActiveByWorkspaceId(workspaceId);
        long archivedCount = taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.ARCHIVED);
        long overdueCount = taskRepository.countOverdueByWorkspaceId(workspaceId, now);

        Instant startOfDay = today.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endOfDay = today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        long dueTodayCount = taskRepository.countDueTodayByWorkspaceId(workspaceId, startOfDay, endOfDay);

        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Instant startOfWeekInst = startOfWeek.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endOfWeekInst = startOfWeek.plusWeeks(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        long dueThisWeekCount = taskRepository.countDueThisWeekByWorkspaceId(workspaceId, startOfWeekInst, endOfWeekInst);

        long completedCount = taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.COMPLETED);
        long total = activeCount + completedCount + archivedCount;
        double completionRate = total > 0 ? (double) (completedCount + archivedCount) / total * 100.0 : 0.0;
        double velocity = 0.0;

        return TaskMetrics.builder()
                .activeCount(activeCount)
                .archivedCount(archivedCount)
                .overdueCount(overdueCount)
                .dueTodayCount(dueTodayCount)
                .dueThisWeekCount(dueThisWeekCount)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .velocity(Math.round(velocity * 100.0) / 100.0)
                .build();
    }
}
