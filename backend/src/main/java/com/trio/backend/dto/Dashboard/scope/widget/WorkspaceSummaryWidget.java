package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Summary widget of the workspace pour le Workspace Dashboard.
 *
 * <p>Contient les statistics globales of the workspace :
 * namebre de departments, of teams et de members.</p>
 */
@Getter
@Setter
public class WorkspaceSummaryWidget {

    /**
     * Nombre total de departments in the workspace.
     */
    private long departmentCount;

    /**
     * Nombre total of teams in the workspace.
     */
    private long teamCount;

    /**
     * Nombre total de members in the workspace.
     */
    private long memberCount;
}

