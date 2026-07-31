package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Summary widget of the department pour le Department Dashboard.
 *
 * <p>Regroupe all information generales of the department :
 * name, description, members, teams, projects.</p>
 */
@Getter
@Setter
public class DepartmentOverviewWidget {

    /**
     * Nom of the department.
     */
    private String departmentName;

    /**
     * Description of the department (si available).
     */
    private String description;

    /**
     * Nombre total de members in the department.
     */
    private long totalMembers;

    /**
     * Nombre de members actives in the department.
     */
    private long activeMembers;

    /**
     * Nombre total of teams in the department.
     */
    private long totalTeams;

    /**
     * Nombre de projects actives in the department.
     */
    private long activeProjects;

    /**
     * Nombre de projects archiveds in the department.
     */
    private long archivedProjects;
}

