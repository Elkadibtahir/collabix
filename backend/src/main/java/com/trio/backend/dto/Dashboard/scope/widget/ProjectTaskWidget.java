package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant une task of a project dans le
 * Project Dashboard.
 */
@Getter
@Setter
public class ProjectTaskWidget {

    /**
     * Identifiant de the task.
     */
    private UUID id;

    /**
     * Titre de the task.
     */
    private String title;

    /**
     * Status de the task.
     */
    private String status;

    /**
     * Name of the assignee (si applicable).
     */
    private String assigneeName;

    /**
     * Date of expiry.
     */
    private Instant dueAt;
}
