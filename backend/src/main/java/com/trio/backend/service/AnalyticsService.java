package com.trio.backend.service;

import com.trio.backend.enums.CommentStatus;
import com.trio.backend.enums.TaskStatus;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.reporting.analytics.builder.ActivityMetricsBuilder;
import com.trio.backend.reporting.analytics.builder.ChartDataBuilder;
import com.trio.backend.reporting.analytics.builder.TaskMetricsBuilder;
import com.trio.backend.reporting.analytics.dto.metrics.DocumentMetrics;
import com.trio.backend.reporting.analytics.dto.metrics.NotificationMetrics;
import com.trio.backend.reporting.analytics.dto.metrics.WorkspaceAnalyticsResponse;
import com.trio.backend.repository.CommentRepository;
import com.trio.backend.repository.DocumentRepository;
import com.trio.backend.repository.KnowledgeBaseRepository;
import com.trio.backend.repository.NotificationRepository;
import com.trio.backend.repository.ProjectRepository;
import com.trio.backend.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final TaskMetricsBuilder taskMetricsBuilder;
    private final ActivityMetricsBuilder activityMetricsBuilder;
    private final ChartDataBuilder chartDataBuilder;
    private final DocumentRepository documentRepository;
    private final KnowledgeBaseRepository KnowledgeBaseRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceAnalyticsResponse getWorkspaceAnalytics(UUID workspaceId) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant startOfDay = today.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endOfDay = today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        long documentCount = documentRepository.countByWorkspace(workspaceId);
        long knowledgeBaseCount = KnowledgeBaseRepository.countByWorkspace(workspaceId);

        long commentCount = commentRepository.countByWorkspaceIdAndStatus(workspaceId, CommentStatus.ACTIVE);
        long memberCount = workspaceMemberRepository.countByWorkspace_IdAndStatus(workspaceId, WorkspaceMemberStatus.ACTIVE);
        long projectCount = projectRepository.countByWorkspaceIdAndStatus(workspaceId, WorkspaceStatus.ACTIVE);

        long notificationTotal = notificationRepository.countByWorkspaceId(workspaceId);
        long unreadCount = notificationRepository.countUnreadByWorkspaceId(workspaceId);
        long todayNotificationCount = notificationRepository.countCreatedTodayByWorkspaceId(workspaceId, startOfDay, endOfDay);

        return WorkspaceAnalyticsResponse.builder()
                .tasks(taskMetricsBuilder.build(workspaceId))
                .activities(activityMetricsBuilder.build(workspaceId))
                .documents(DocumentMetrics.builder()
                        .documentCount(documentCount)
                        .knowledgeBaseCount(knowledgeBaseCount)
                        .totalSizeBytes(documentRepository.getTotalSizeByWorkspace(workspaceId) != null
                                ? documentRepository.getTotalSizeByWorkspace(workspaceId) : 0L)
                        .build())
                .notifications(NotificationMetrics.builder()
                        .totalCount(notificationTotal)
                        .unreadCount(unreadCount)
                        .todayCount(todayNotificationCount)
                        .build())
                .commentCount(commentCount)
                .memberCount(memberCount)
                .projectCount(projectCount)
                .charts(chartDataBuilder.buildTaskCharts(workspaceId))
                .build();
    }
}
