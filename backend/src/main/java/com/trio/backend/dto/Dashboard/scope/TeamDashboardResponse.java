package com.trio.backend.dto.Dashboard.scope;

import com.trio.backend.dto.Dashboard.scope.widget.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Response du Team Dashboard.
 *
 * <p>Ce DTO contains les information relatives Ã  a team specific
 * in a workspace. Il est destinÃ© aux Team Leaders et Administrators
 * of the workspace.</p>
 *
 * <p>The data sont organizedes en deux sections :</p>
 * <ol>
 *   <li><strong>Team Information</strong> â€” givens propres Ã  the team
 *       (vue d'ensemble, members, Statistics, tasks, notifications, activitys).</li>
 *   <li><strong>Department Context</strong> â€” givens of the department parent
 *       (projects, documents, articles de lowe de connaissances).
 *       Ces information sont clearement Ã©tiquetÃ©es comme appartenant au
 *       department, pas Ã  the team.</li>
 * </ol>
 *
 * <p>Les information sont aggregated depuis les modules following :
 * Team, Members, Tasks, Activitys, Notifications, Projects,
 * Documents, Lowe de connaissances.</p>
 *
 * <p>La portÃ©e est toudays validatede par {@code workspaceId} pour preservesr
 * la multi-tenantitÃ©. Aucune information hors of the workspace current
 * n'est exposede.</p>
 *
 * @see TeamOverviewWidget
 * @see TaskSummaryWidget
 * @see TeamMemberWidget
 * @see TeamStatisticsWidget
 * @see DepartmentProjectWidget
 * @see PersonalDocumentWidget
 * @see PersonalKnowledgeArticleWidget
 * @see DepartmentActivityWidget
 * @see DepartmentNotificationWidget
 */
@Getter
@Setter
public class TeamDashboardResponse {

    // =========================================================================
    // Team Information
    // =========================================================================

    /**
     * Vue d'ensemble de the team (name, description, department, status, members).
     */
    private TeamOverviewWidget overview;

    /**
     * Summary of tasks related aux projects of the department de the team.
     *
     * <p>Les tasks are not directement related Ã  the team. Elles sont
     * aggregated au niveau of the department parent.</p>
     */
    private TaskSummaryWidget taskSummary;

    /**
     * Liste of members de the team.
     */
    private List<TeamMemberWidget> teamMembers;

    /**
     * Statistics of members de the team.
     */
    private TeamStatisticsWidget teamStatistics;

    /**
     * Activitys recents dans the projects of the department de the team.
     */
    private List<DepartmentActivityWidget> teamActivities;

    /**
     * Notifications recents related aux projects of the department de the team.
     */
    private List<DepartmentNotificationWidget> teamNotifications;

    /**
     * Nombre de notifications non lues in the department de the team.
     */
    private long unreadNotificationCount;

    // =========================================================================
    // Department Context (clearement Ã©tiquetÃ©)
    // =========================================================================

    /**
     * Projects actives of the department parent.
     *
     * <p>Les projects appartiennent aux departments, pas aux teams.
     * Ces givens sont proemptyds to give of the context au Team Leader.</p>
     */
    private List<DepartmentProjectWidget> activeDepartmentProjects;

    /**
     * Projects rÃ©cemment created in the department parent.
     */
    private List<DepartmentProjectWidget> recentlyCreatedProjects;

    /**
     * Projects rÃ©cemment updated in the department parent.
     */
    private List<DepartmentProjectWidget> recentlyUpdatedProjects;

    /**
     * Documents recent of projects of the department parent.
     */
    private List<PersonalDocumentWidget> recentDocuments;

    /**
     * Articles de lowe de connaissances recent of projects of the department parent.
     *
     * <p>Les articles of the lowe de connaissances sont relateds aux projects,
     * qui appartiennent aux departments. Ils sont aggregateds au niveau
     * of the department parent to give of the context.</p>
     */
    private List<PersonalKnowledgeArticleWidget> recentKnowledgeArticles;
}

