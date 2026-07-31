package com.trio.backend.dto.hr;

import com.trio.backend.entity.Notification;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class HrNotificationSearchCriteria {

    private UUID recipientId;
    private Notification.NotificationType notificationType;
    private String module;
    private Notification.NotificationStatus status;
    private Instant dateFrom;
    private Instant dateTo;
}
