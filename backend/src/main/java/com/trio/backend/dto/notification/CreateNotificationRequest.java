package com.trio.backend.dto.notification;

import com.trio.backend.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Create request of a Notification.
 */
@Getter
@Setter
public class CreateNotificationRequest {

    @NotNull
    private UUID workspaceId;

    @NotNull
    private UUID recipientId;

    @NotNull
    private Notification.NotificationType notificationType;

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 2000)
    private String body;

    @Size(max = 500)
    private String linkUrl;

    // Optional resource references

    private UUID projectId;

    private UUID taskId;

    private UUID commentId;

    private UUID documentId;

    private UUID KnowledgeBaseId;

    private UUID handoverEntryId;

    // Generic future resource reference
    @Size(max = 50)
    private String resourceType;

    private UUID resourceId;

    // Classification

    private String priority;

    @Size(max = 50)
    private String category;

    @Size(max = 100)
    private String groupKey;
}
