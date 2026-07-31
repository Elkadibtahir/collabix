package com.trio.backend.dto.hr;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class HrNotificationStatistics {

    private long totalNotifications;
    private long unreadCount;
    private long readCount;
    private long dismissedCount;
    private long archivedCount;
    private long todayCount;
    private Map<String, Long> notificationsByType;
    private Map<String, Long> notificationsByModule;
    private Map<String, Long> notificationsByStatus;
}
