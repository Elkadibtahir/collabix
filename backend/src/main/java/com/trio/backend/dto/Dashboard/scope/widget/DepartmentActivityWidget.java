package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant une activity recent in a department
 * pour le Department Dashboard.
 */
@Getter
@Setter
public class DepartmentActivityWidget {

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
     * Nom of the project associÃ©.
     */
    private String projectName;

    /**
     * Timestamp of the activity.
     */
    private Instant createdAt;
}
