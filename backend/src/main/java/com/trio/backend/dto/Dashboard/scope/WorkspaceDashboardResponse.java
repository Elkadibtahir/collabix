package com.trio.backend.dto.Dashboard.scope;

import com.trio.backend.dto.Dashboard.scope.widget.DepartmentSummaryWidget;
import com.trio.backend.dto.Dashboard.scope.widget.MemberSummaryWidget;
import com.trio.backend.dto.Dashboard.scope.widget.WorkspaceSummaryWidget;
import com.trio.backend.dto.Dashboard.scope.widget.ProjectSummaryWidget;
import com.trio.backend.dto.Dashboard.scope.widget.TeamSummaryWidget;
import com.trio.backend.dto.Dashboard.scope.widget.TaskSummaryWidget;
import com.trio.backend.dto.Dashboard.scope.widget.NotificationSummaryWidget;
import com.trio.backend.dto.Dashboard.scope.widget.RecentActivityWidget;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Response of the workspace Dashboard.
 *
 * <p>Ce DTO contains uniquement les statistics globales of the workspace.
 * Il est destinÃ© aux owners (OWNER) et administrators (ADMIN)
 * of the workspace.</p>
 *
 * <p>Les information sont aggregated depuis les modules following :
 * Workspace, Organization (departments, teams, members), Projects,
 * Tasks, Notifications et Activitys.</p>
 *
 * <p>Each section est encapsulated dans un sous-DTO (widget) pour
 * rester extensible sans impacter la structure globale.</p>
 *
 * @see WorkspaceSummaryWidget
 * @see DepartmentSummaryWidget
 * @see TeamSummaryWidget
 * @see MemberSummaryWidget
 * @see ProjectSummaryWidget
 * @see TaskSummaryWidget
 * @see NotificationSummaryWidget
 * @see RecentActivityWidget
 */
@Getter
@Setter
public class WorkspaceDashboardResponse {

    /**
     * Summary of the workspace : departments, teams, members.
     */
    private WorkspaceSummaryWidget workspaceSummary;

    /**
     * Summary des departments : total, actives, archiveds.
     */
    private DepartmentSummaryWidget departmentSummary;

    /**
     * Summary of teams : total, actives, mediumne de members par team.
     */
    private TeamSummaryWidget teamSummary;

    /**
     * Summary of members : total, actives, pending of activation, lockeds, suspendeds.
     */
    private MemberSummaryWidget memberSummary;

    /**
     * Summary of projects : total, actives, archiveds.
     */
    private ProjectSummaryWidget projectSummary;

    /**
     * Summary of tasks : total, actives, en delay, deadlines.
     */
    private TaskSummaryWidget taskSummary;

    /**
     * Summary of notifications : total, non lues, created today.
     */
    private NotificationSummaryWidget notificationSummary;

    /**
     * List of activitys recents of the workspace.
     */
    private List<RecentActivityWidget> recentActivities;
}

