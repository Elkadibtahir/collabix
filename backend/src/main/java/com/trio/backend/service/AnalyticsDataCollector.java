package com.trio.backend.service;

import com.trio.backend.entity.Project;
import com.trio.backend.entity.Workspace;
import com.trio.backend.repository.ProjectRepository;
import com.trio.backend.repository.WorkspaceRepository;
import com.trio.backend.reporting.analytics.dto.metrics.WorkspaceAnalyticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalyticsDataCollector {

    private final AnalyticsService analyticsService;
    private final DashboardService dashboardService;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;

    public Map<String, Object> collect(UUID workspaceId, UUID departmentId, UUID projectId,
                                        LocalDate startDate, LocalDate endDate) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        WorkspaceAnalyticsResponse wsAnalytics = analyticsService.getWorkspaceAnalytics(workspaceId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("workspaceName", workspace.getName());
        data.put("workspaceId", workspaceId);
        data.put("departmentId", departmentId);
        data.put("projectId", projectId);
        data.put("reportDate", LocalDate.now().toString());
        data.put("timeRangeStart", startDate != null ? startDate.toString() : null);
        data.put("timeRangeEnd", endDate != null ? endDate.toString() : null);

        data.put("tasks", buildTaskMetricsMap(wsAnalytics));
        data.put("activities", buildActivityMetricsMap(wsAnalytics));
        data.put("documents", buildDocumentMetricsMap(wsAnalytics));
        data.put("notifications", buildNotificationMetricsMap(wsAnalytics));
        data.put("commentCount", wsAnalytics.getCommentCount());
        data.put("memberCount", wsAnalytics.getMemberCount());
        data.put("projectCount", wsAnalytics.getProjectCount());
        data.put("charts", buildChartsMap(wsAnalytics));

        var wsDashboard = dashboardService.getWorkspaceDashboard(workspaceId);
        data.put("workspaceSummary", buildWorkspaceSummaryMap(wsDashboard));
        data.put("memberSummary", buildMemberSummaryMap(wsDashboard));
        data.put("projectSummary", buildProjectSummaryMap(wsDashboard));
        data.put("taskSummary", buildTaskSummaryMap(wsDashboard));
        data.put("notificationSummary", buildNotificationSummaryMap(wsDashboard));

        if (projectId != null) {
            Project project = projectRepository.findByIdAndDepartment_Id(projectId, departmentId)
                    .orElse(null);
            if (project != null) {
                data.put("projectName", project.getName());
                data.put("projectDescription", project.getDescription());
                data.put("projectStatus", project.getStatus());
                var projectDashboard = dashboardService.getProjectDashboard(workspaceId, projectId);
                data.put("projectProgress", buildProjectProgressMap(projectDashboard));
            }
        }

        return data;
    }

    public Map<String, Object> collect(UUID workspaceId, UUID departmentId, UUID projectId) {
        return collect(workspaceId, departmentId, projectId, null, null);
    }

    private Map<String, Object> buildTaskMetricsMap(WorkspaceAnalyticsResponse analytics) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("activeCount", analytics.getTasks().getActiveCount());
        map.put("archivedCount", analytics.getTasks().getArchivedCount());
        map.put("overdueCount", analytics.getTasks().getOverdueCount());
        map.put("dueTodayCount", analytics.getTasks().getDueTodayCount());
        map.put("dueThisWeekCount", analytics.getTasks().getDueThisWeekCount());
        map.put("completionRate", analytics.getTasks().getCompletionRate());
        map.put("velocity", analytics.getTasks().getVelocity());
        return map;
    }

    private Map<String, Object> buildActivityMetricsMap(WorkspaceAnalyticsResponse analytics) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("totalCount", analytics.getActivities().getTotalCount());
        return map;
    }

    private Map<String, Object> buildDocumentMetricsMap(WorkspaceAnalyticsResponse analytics) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("documentCount", analytics.getDocuments().getDocumentCount());
        map.put("knowledgeBaseCount", analytics.getDocuments().getKnowledgeBaseCount());
        map.put("totalSizeBytes", analytics.getDocuments().getTotalSizeBytes());
        return map;
    }

    private Map<String, Object> buildNotificationMetricsMap(WorkspaceAnalyticsResponse analytics) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("totalCount", analytics.getNotifications().getTotalCount());
        map.put("unreadCount", analytics.getNotifications().getUnreadCount());
        map.put("todayCount", analytics.getNotifications().getTodayCount());
        return map;
    }

    private Map<String, Object> buildChartsMap(WorkspaceAnalyticsResponse analytics) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("chartCount", analytics.getCharts() != null ? analytics.getCharts().size() : 0);
        if (analytics.getCharts() != null) {
            map.put("charts", analytics.getCharts().stream().map(chart -> {
                Map<String, Object> chartMap = new LinkedHashMap<>();
                chartMap.put("chartId", chart.getChartId());
                chartMap.put("title", chart.getTitle());
                chartMap.put("type", chart.getType());
                chartMap.put("labels", chart.getLabels());
                if (chart.getSeries() != null) {
                    chartMap.put("series", chart.getSeries().stream().map(series -> {
                        Map<String, Object> seriesMap = new LinkedHashMap<>();
                        seriesMap.put("name", series.getName());
                        seriesMap.put("color", series.getColor());
                        if (series.getPoints() != null) {
                            seriesMap.put("points", series.getPoints().stream().map(point -> {
                                Map<String, Object> pointMap = new LinkedHashMap<>();
                                pointMap.put("label", point.getLabel());
                                pointMap.put("value", point.getValue());
                                return pointMap;
                            }).toList());
                        }
                        return seriesMap;
                    }).toList());
                }
                return chartMap;
            }).toList());
        }
        return map;
    }

    private Map<String, Object> buildWorkspaceSummaryMap(
            com.trio.backend.dto.Dashboard.scope.WorkspaceDashboardResponse dashboard) {
        Map<String, Object> map = new LinkedHashMap<>();
        var ws = dashboard.getWorkspaceSummary();
        if (ws != null) {
            map.put("departmentCount", ws.getDepartmentCount());
            map.put("teamCount", ws.getTeamCount());
            map.put("memberCount", ws.getMemberCount());
        }
        return map;
    }

    private Map<String, Object> buildMemberSummaryMap(
            com.trio.backend.dto.Dashboard.scope.WorkspaceDashboardResponse dashboard) {
        Map<String, Object> map = new LinkedHashMap<>();
        var ms = dashboard.getMemberSummary();
        if (ms != null) {
            map.put("totalMembers", ms.getTotalMembers());
            map.put("activeMembers", ms.getActiveMembers());
            map.put("pendingActivation", ms.getPendingActivation());
            map.put("lockedAccounts", ms.getLockedAccounts());
            map.put("suspendedAccounts", ms.getSuspendedAccounts());
        }
        return map;
    }

    private Map<String, Object> buildProjectSummaryMap(
            com.trio.backend.dto.Dashboard.scope.WorkspaceDashboardResponse dashboard) {
        Map<String, Object> map = new LinkedHashMap<>();
        var ps = dashboard.getProjectSummary();
        if (ps != null) {
            map.put("totalProjects", ps.getTotalProjects());
            map.put("activeProjects", ps.getActiveProjects());
            map.put("archivedProjects", ps.getArchivedProjects());
        }
        return map;
    }

    private Map<String, Object> buildTaskSummaryMap(
            com.trio.backend.dto.Dashboard.scope.WorkspaceDashboardResponse dashboard) {
        Map<String, Object> map = new LinkedHashMap<>();
        var ts = dashboard.getTaskSummary();
        if (ts != null) {
            map.put("totalTasks", ts.getTotalTasks());
            map.put("activeTasks", ts.getActiveTasks());
            map.put("archivedTasks", ts.getArchivedTasks());
            map.put("overdueTasks", ts.getOverdueTasks());
            map.put("tasksDueToday", ts.getTasksDueToday());
            map.put("tasksDueThisWeek", ts.getTasksDueThisWeek());
        }
        return map;
    }

    private Map<String, Object> buildNotificationSummaryMap(
            com.trio.backend.dto.Dashboard.scope.WorkspaceDashboardResponse dashboard) {
        Map<String, Object> map = new LinkedHashMap<>();
        var ns = dashboard.getNotificationSummary();
        if (ns != null) {
            map.put("totalNotifications", ns.getTotalNotifications());
            map.put("unreadNotifications", ns.getUnreadNotifications());
            map.put("notificationsCreatedToday", ns.getNotificationsCreatedToday());
        }
        return map;
    }

    private Map<String, Object> buildProjectProgressMap(
            com.trio.backend.dto.Dashboard.scope.ProjectDashboardResponse projectDashboard) {
        Map<String, Object> map = new LinkedHashMap<>();
        var pp = projectDashboard.getProjectProgress();
        if (pp != null) {
            map.put("totalTasks", pp.getTotalTasks());
            map.put("completedTasks", pp.getCompletedTasks());
            map.put("progressPercentage", pp.getProgressPercentage());
        }
        return map;
    }
}
