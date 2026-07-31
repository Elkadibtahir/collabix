package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Summary widget of projects pour le Workspace Dashboard.
 *
 * <p>Contient the namebre total de projects, the namebre de projects
 * actives et the namebre de projects archiveds.</p>
 */
@Getter
@Setter
public class ProjectSummaryWidget {

    /**
     * Nombre total de projects.
     */
    private long totalProjects;

    /**
     * Nombre de projects actives.
     */
    private long activeProjects;

    /**
     * Nombre de projects archiveds.
     */
    private long archivedProjects;
}
