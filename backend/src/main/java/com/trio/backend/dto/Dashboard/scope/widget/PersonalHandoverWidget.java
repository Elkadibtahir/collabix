package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Widget representant un handover (passation) de the user
 * authenticated pour today dans le Personal Dashboard.
 *
 * <p>Affiche les passations oÃ¹ the user est l'author ou
 * le recipient pour la day in progress.</p>
 */
@Getter
@Setter
public class PersonalHandoverWidget {

    /**
     * ID of the entry de handover.
     */
    private UUID id;

    /**
     * Nom of the project associÃ© au handover.
     */
    private String projectName;

    /**
     * Quart de travail (MORNING, EVENING).
     */
    private String shift;

    /**
     * Heure de passage.
     */
    private LocalDateTime passedAt;

    /**
     * Status de validation manager.
     */
    private String managerValidationStatus;
}

