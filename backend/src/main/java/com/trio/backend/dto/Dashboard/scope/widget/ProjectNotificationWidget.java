package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * @deprecated This widget was designed for a potential "notifications" section in
 * {@link com.trio.backend.dto.Dashboard.scope.ProjectDashboardResponse}
 * goal was never used. No builder or repository method references this class.
 * Retained for reference only. Will be removed in a future version.
 */
@Deprecated
@Getter
@Setter
public class ProjectNotificationWidget {

    /**
     * Identifiant de the notification.
     */
    private UUID id;

    /**
     * Titre de the notification.
     */
    private String title;

    /**
     * Type de notification.
     */
    private String notificationType;

    /**
     * Status de lecture.
     */
    private String status;

    /**
     * Date de creation.
     */
    private Instant createdAt;
}

