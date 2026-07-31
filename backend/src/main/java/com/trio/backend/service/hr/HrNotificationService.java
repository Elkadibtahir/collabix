package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.HrNotificationSearchCriteria;
import com.trio.backend.dto.hr.HrNotificationStatistics;
import com.trio.backend.dto.notification.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface HrNotificationService {

    Page<NotificationResponse> search(UUID workspaceId, UUID departmentId, HrNotificationSearchCriteria criteria, Pageable pageable);

    NotificationResponse getById(UUID workspaceId, UUID departmentId, UUID notificationId);

    NotificationResponse markAsRead(UUID workspaceId, UUID departmentId, UUID notificationId);

    void markAllAsRead(UUID workspaceId, UUID departmentId, UUID recipientId);

    NotificationResponse dismiss(UUID workspaceId, UUID departmentId, UUID notificationId);

    void delete(UUID workspaceId, UUID departmentId, UUID notificationId);

    HrNotificationStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
