package com.trio.backend.dto.Dashboard.scope;

import com.trio.backend.dto.Dashboard.scope.widget.DepartmentActivityWidget;
import com.trio.backend.dto.Dashboard.scope.widget.DepartmentAIModelWidget;
import com.trio.backend.dto.Dashboard.scope.widget.DepartmentMemberWidget;
import com.trio.backend.dto.Dashboard.scope.widget.DepartmentNotificationWidget;
import com.trio.backend.dto.Dashboard.scope.widget.DepartmentOverviewWidget;
import com.trio.backend.dto.Dashboard.scope.widget.DepartmentProjectWidget;
import com.trio.backend.dto.Dashboard.scope.widget.DepartmentTaskWidget;
import com.trio.backend.dto.Dashboard.scope.widget.PersonalDocumentWidget;
import com.trio.backend.dto.Dashboard.scope.widget.PersonalKnowledgeArticleWidget;
import com.trio.backend.dto.Dashboard.scope.widget.TaskSummaryWidget;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Response du Department Dashboard.
 *
 * <p>Ce DTO contains uniquement les information relatives Ã  un
 * department specific. Il est destinÃ© aux responsibles de
 * department (MANAGER) ou all member authorized of the workspace.</p>
 *
 * <p>Les information sont aggregated depuis les modules following :
 * Projects, Tasks, Members, Documents, Lowe de connaissances,
 * Activitys et Notifications of the department.</p>
 *
 * <p>Each section est encapsulated dans un sous-DTO (widget) pour
 * rester extensible sans impacter la structure globale.</p>
 *
 * @see DepartmentOverviewWidget
 * @see TaskSummaryWidget
 * @see DepartmentProjectWidget
 * @see DepartmentTaskWidget
 * @see DepartmentMemberWidget
 * @see PersonalDocumentWidget
 * @see PersonalKnowledgeArticleWidget
 * @see DepartmentActivityWidget
 * @see DepartmentNotificationWidget
 */
@Getter
@Setter
public class DepartmentDashboardResponse {

    /**
     * Summary general of the department (name, description, members, teams, projects).
     */
    private DepartmentOverviewWidget overview;

    /**
     * Summary of tasks of the department (total, actives, archivedes, en delay, deadlines).
     */
    private TaskSummaryWidget taskSummary;

    /**
     * Liste of projects actives of the department.
     */
    private List<DepartmentProjectWidget> activeProjects;

    /**
     * Liste of projects rÃ©cemment created in the department.
     */
    private List<DepartmentProjectWidget> recentProjects;

    /**
     * Liste of projects rÃ©cemment updated in the department.
     */
    private List<DepartmentProjectWidget> recentlyUpdatedProjects;

    /**
     * @deprecated This field was never populated and is no longer part of the Department Dashboard API.
     * It is retained only to avoid breaking binary compatibility during the transition period.
     * Will be removed in a future version.
     */
    @Deprecated
    private List<DepartmentTaskWidget> departmentTasks;


    /**
     * Liste of members of the department.
     */
    private List<DepartmentMemberWidget> departmentMembers;

    /**
     * Documents recent of the department.
     */
    private List<PersonalDocumentWidget> recentDocuments;

    /**
     * Articles de lowe de connaissances recent of the department.
     */
    private List<PersonalKnowledgeArticleWidget> recentKnowledgeArticles;

    /**
     * List of activitys recents of the department.
     */
    private List<DepartmentActivityWidget> departmentActivities;

    /**
     * Liste of notifications of the department.
     */
    private List<DepartmentNotificationWidget> departmentNotifications;

    /**
     * Nombre de notifications non lues in the department.
     */
    private long unreadNotificationCount;

    /**
     * Summary des templates IA in the department.
     */
    private DepartmentAIModelWidget aiModelSummary;
}

