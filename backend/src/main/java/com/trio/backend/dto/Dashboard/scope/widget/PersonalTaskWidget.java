package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant une task assigneee Ã  the authenticated user
 * dans le Personal Dashboard.
 *
 * <p>Contient les information essentialles de the task ainsi que
 * the context of the project auquel elle belong.</p>
 */
@Getter
@Setter
public class PersonalTaskWidget {

    /**
     * Identifiant de the task.
     */
    private UUID id;

    /**
     * Titre de the task.
     */
    private String title;

    /**
     * Identifiant of the project parent.
     */
    private UUID projectId;

    /**
     * Nom of the project parent.
     */
    private String projectName;

    /**
     * Status de the task.
     */
    private String status;

    /**
     * Date of expiry de the task.
     */
    private Instant dueAt;
}

