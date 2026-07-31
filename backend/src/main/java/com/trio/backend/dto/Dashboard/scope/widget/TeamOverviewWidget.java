package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Summary widget de the team pour le Team Dashboard.
 *
 * <p>Regroupe uniquement les information directement related Ã  the team :
 * name, description, status, department parent et statistics of members.</p>
 *
 * <p>Ne contains pas de givens inventÃ©es (teamLeader, projects de the team).
 * Les information sur the projects sont exposedes separately via
 * {@link DepartmentProjectWidget} avec un Ã©tiquetage clear comme
 * "Projects of the department".</p>
 */
@Getter
@Setter
public class TeamOverviewWidget {

    /**
     * Nom de the team.
     */
    private String teamName;

    /**
     * Description de the team (si available).
     */
    private String description;

    /**
     * Status de the team (ACTIVE, ARCHIVED).
     */
    private String status;

    /**
     * Nom of the department parent.
     */
    private String departmentName;

    /**
     * Nombre total de members dans the team.
     */
    private long totalMembers;

    /**
     * Nombre de members actives dans the team.
     */
    private long activeMembers;
}

