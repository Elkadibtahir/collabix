package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant une activity dans la timeline of a project
 * pour le Project Dashboard.
 */
@Getter
@Setter
public class ProjectActivityWidget {

    /**
     * ID of the activity.
     */
    private UUID id;

    /**
     * Textual description of the activity.
     */
    private String description;

    /**
     * Nom de l'acteur.
     */
    private String actorName;

    /**
     * Timestamp of the activity.
     */
    private Instant createdAt;
}
