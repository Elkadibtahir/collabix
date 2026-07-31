package com.trio.backend.dto.notification;

import com.trio.backend.entity.Notification;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Response for une Notification.
 *
 * <p>Fields ssortctement required au frontend.</p>
 */
@Getter
@Setter
public class NotificationResponse {

    private UUID id;

    private UUID workspaceId;

    private UUID recipientId;

    private Notification.NotificationType notificationType;

    private String title;

    private String body;

    private String linkUrl;

    private UUID projectId;

    private UUID taskId;

    private UUID commentId;

    private UUID documentId;

    private UUID KnowledgeBaseId;

    private UUID handoverEntryId;

    private String resourceType;

    private UUID resourceId;

    private Instant readAt;

    private Notification.NotificationStatus status;

    private String priority;

    private String category;

    private String groupKey;

    private Instant createdAt;

    private Instant updatedAt;
}
