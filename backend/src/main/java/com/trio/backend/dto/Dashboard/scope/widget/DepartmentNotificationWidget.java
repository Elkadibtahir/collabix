package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant une notification au niveau of a department
 * dans le Department Dashboard.
 */
@Getter
@Setter
public class DepartmentNotificationWidget {

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
     * Nom of the project associÃ©.
     */
    private String projectName;

    /**
     * Status de lecture.
     */
    private String status;

    /**
     * Date de creation.
     */
    private Instant createdAt;
}
