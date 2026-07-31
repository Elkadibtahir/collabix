package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Widget representant la progression of a project dans le
 * Project Dashboard.
 *
 * <p>Contient des indicators clÃ©s de l'advancement of the project :
 * namebre total de tasks, tasks Completedes et pourcentage
 * de progression.</p>
 */
@Getter
@Setter
public class ProjectProgressWidget {

    /**
     * Nombre total de tasks dans the project.
     */
    private long totalTasks;

    /**
     * Nombre de tasks Completedes.
     */
    private long CompletedTasks;

    /**
     * Pourcentage de progression (0-100).
     */
    private int progressPercentage;
}
