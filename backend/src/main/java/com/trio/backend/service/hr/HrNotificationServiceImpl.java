package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.HrNotificationSearchCriteria;
import com.trio.backend.dto.hr.HrNotificationStatistics;
import com.trio.backend.dto.notification.NotificationResponse;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.Notification.NotificationStatus;
import com.trio.backend.entity.Notification.NotificationType;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.NotificationMapper;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.HrNotificationSpecification;
import com.trio.backend.repository.NotificationRepository;
import com.trio.backend.service.NotificationService;
import com.trio.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class HrNotificationServiceImpl implements HrNotificationService {

    private static final List<NotificationType> HR_NOTIFICATION_TYPES = Arrays.asList(
            NotificationType.CANDIDATE_CREATED,
            NotificationType.CANDIDATE_UPDATED,
            NotificationType.ATS_STATUS_CHANGED,
            NotificationType.INTERVIEW_SCHEDULED,
            NotificationType.INTERVIEW_CANCELLED,
            NotificationType.INTERVIEW_COMPLETED,
            NotificationType.RECRUITER_NOTE_ADDED,
            NotificationType.ATTACHMENT_UPLOADED,
            NotificationType.ATTACHMENT_REPLACED,
            NotificationType.EMPLOYEE_CREATED,
            NotificationType.EMPLOYEE_TRANSFERRED,
            NotificationType.MANAGER_CHANGED,
            NotificationType.DEPARTMENT_CHANGED,
            NotificationType.TEAM_CHANGED,
            NotificationType.SKILL_ADDED,
            NotificationType.SKILL_VERIFIED,
            NotificationType.CERTIFICATION_EXPIRING,
            NotificationType.ONBOARDING_STARTED,
            NotificationType.ONBOARDING_COMPLETED,
            NotificationType.ONBOARDING_OVERDUE,
            NotificationType.ATTENDANCE_CHECK_IN,
            NotificationType.ATTENDANCE_CHECK_OUT,
            NotificationType.ATTENDANCE_CORRECTED,
            NotificationType.ATTENDANCE_MISSING_CHECKOUT,
            NotificationType.ATTENDANCE_LATE_ARRIVAL,
            NotificationType.ATTENDANCE_EXCESSIVE_OVERTIME,
            NotificationType.REVIEW_ASSIGNED,
            NotificationType.REVIEW_SUBMITTED,
            NotificationType.REVIEW_APPROVED,
            NotificationType.REVIEW_REJECTED
    );

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final NotificationService notificationService;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> search(UUID workspaceId, UUID departmentId,
                                              HrNotificationSearchCriteria criteria, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return notificationRepository.findAll(
                        HrNotificationSpecification.withFilter(workspaceId, criteria), pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getById(UUID workspaceId, UUID departmentId, UUID notificationId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return notificationService.getById(workspaceId, notificationId);
    }

    @Override
    public NotificationResponse markAsRead(UUID workspaceId, UUID departmentId, UUID notificationId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return notificationService.markAsRead(workspaceId, notificationId);
    }

    @Override
    public void markAllAsRead(UUID workspaceId, UUID departmentId, UUID recipientId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        notificationService.markAllAsRead(workspaceId, recipientId);
    }

    @Override
    public NotificationResponse dismiss(UUID workspaceId, UUID departmentId, UUID notificationId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!notification.getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Notification not found.");
        }

        notification.setStatus(NotificationStatus.DISMISSED);
        Notification saved = notificationRepository.save(notification);

        log.info("Notification {} dismissed by user {}", notificationId, userId);
        return notificationMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID workspaceId, UUID departmentId, UUID notificationId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        notificationService.delete(workspaceId, notificationId);
    }

    @Override
    @Transactional(readOnly = true)
    public HrNotificationStatistics getStatistics(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        HrNotificationStatistics stats = new HrNotificationStatistics();

        List<Object[]> typeCounts = notificationRepository.countByTypeGroupedFiltered(workspaceId, HR_NOTIFICATION_TYPES);
        long total = 0;
        Map<String, Long> byType = new HashMap<>();
        for (Object[] row : typeCounts) {
            NotificationType type = (NotificationType) row[0];
            long count = (Long) row[1];
            byType.put(type.name(), count);
            total += count;
        }
        stats.setTotalNotifications(total);
        stats.setNotificationsByType(byType);

        List<Object[]> statusCounts = notificationRepository.countByStatusGroupedFiltered(workspaceId, HR_NOTIFICATION_TYPES);
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            NotificationStatus status = (NotificationStatus) row[0];
            long count = (Long) row[1];
            byStatus.put(status.name(), count);
            switch (status) {
                case UNREAD -> stats.setUnreadCount(count);
                case READ -> stats.setReadCount(count);
                case DISMISSED -> stats.setDismissedCount(count);
                case ARCHIVED -> stats.setArchivedCount(count);
            }
        }
        stats.setNotificationsByStatus(byStatus);

        Instant now = Instant.now();
        Instant startOfDay = now.truncatedTo(java.time.temporal.ChronoUnit.DAYS);
        Instant endOfDay = startOfDay.plus(Duration.ofDays(1));
        long todayCount = notificationRepository.countCreatedTodayByWorkspaceIdAndTypes(
                workspaceId, HR_NOTIFICATION_TYPES, startOfDay, endOfDay);
        stats.setTodayCount(todayCount);

        Map<String, Long> byModule = new HashMap<>();
        for (Map.Entry<String, Long> entry : byType.entrySet()) {
            String module = mapTypeToModule(entry.getKey());
            byModule.merge(module, entry.getValue(), Long::sum);
        }
        stats.setNotificationsByModule(byModule);

        return stats;
    }

    private String mapTypeToModule(String typeName) {
        if (typeName.startsWith("CANDIDATE_") || typeName.startsWith("ATS_")
                || typeName.startsWith("INTERVIEW_") || typeName.startsWith("RECRUITER_")) {
            return "RECRUITMENT";
        }
        if (typeName.startsWith("ATTENDANCE_")) {
            return "ATTENDANCE";
        }
        if (typeName.startsWith("REVIEW_")) {
            return "PERFORMANCE_REVIEW";
        }
        if (typeName.startsWith("ONBOARDING_")) {
            return "ONBOARDING";
        }
        if (typeName.startsWith("SKILL_") || typeName.startsWith("CERTIFICATION_")) {
            return "SKILLS";
        }
        if (typeName.startsWith("EMPLOYEE_") || typeName.startsWith("MANAGER_")
                || typeName.startsWith("DEPARTMENT_") || typeName.startsWith("TEAM_")) {
            return "EMPLOYEE";
        }
        if (typeName.startsWith("ATTACHMENT_")) {
            return "DOCUMENTS";
        }
        return "OTHER";
    }

    private void findActiveDepartment(UUID workspaceId, UUID departmentId) {
        departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .filter(dept -> dept.getStatus() == WorkspaceStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
    }
}
