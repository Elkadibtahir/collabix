package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * @deprecated This widget was designed for a potential "overview" section in
 * {@link com.trio.backend.dto.Dashboard.scope.ProjectDashboardResponse}
 * goal was never used. No builder or repository method references this class.
 * Retained for reference only. Will be removed in a future version.
 */
@Deprecated
@Getter
@Setter
public class ProjectOverviewWidget {

    /**
     * Nom of the project.
     */
    private String projectName;

    /**
     * Description of the project (si available).
     */
    private String description;

    /**
     * Nom of the department owner.
     */
    private String departmentName;

    /**
     * Status of the project.
     */
    private String status;

    /**
     * Nombre total de members dans the project
     * (via the department et ses teams).
     */
    private long totalMembers;

    /**
     * Nombre total de tasks dans the project.
     */
    private long totalTasks;

    /**
     * Nombre de tasks actives.
     */
    private long activeTasks;

    /**
     * Nombre de tasks archivedes.
     */
    private long archivedTasks;

    /**
     * Nombre de tasks en delay.
     */
    private long overdueTasks;

    /**
     * Pourcentage de complÃ©tion (0-100).
     */
    private int completionPercentage;
}

