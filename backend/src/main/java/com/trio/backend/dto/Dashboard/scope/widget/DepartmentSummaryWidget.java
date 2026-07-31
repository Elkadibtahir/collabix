package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Summary widget des departments pour le Workspace Dashboard.
 *
 * <p>Contient the namebre total de departments, the namebre de departments
 * actives et the namebre de departments archiveds.</p>
 */
@Getter
@Setter
public class DepartmentSummaryWidget {

    /**
     * Nombre total de departments in the workspace.
     */
    private long totalDepartments;

    /**
     * Nombre de departments actives.
     */
    private long activeDepartments;

    /**
     * Nombre de departments archiveds.
     */
    private long archivedDepartments;
}

