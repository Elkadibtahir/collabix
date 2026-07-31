package com.trio.backend.service;

import com.trio.backend.dto.Dashboard.scope.DepartmentDashboardResponse;
import com.trio.backend.dto.Dashboard.scope.PersonalDashboardResponse;
import com.trio.backend.dto.Dashboard.scope.ProjectDashboardResponse;
import com.trio.backend.dto.Dashboard.scope.TeamDashboardResponse;
import com.trio.backend.dto.Dashboard.scope.WorkspaceDashboardResponse;

import java.util.UUID;

/**
 * Contrat of the service Dashboard â€” refactored pour 4 scopes distincts.
 *
 * <p>The Dashboard is an aggregation-only module. Il ne possÃ¨de
 * no data of its own and merely aggregates les information
 * from other modules de Collabix (Workspace, Departments,
 * Teams, Members, Projects, Tasks, Comments, Activities, Documents,
 * Knowledge Lowe, Handover Journal, Notifications).</p>
 *
 * <p>Four scopes are exposed :</p>
 * <ul>
 *   <li><strong>Workspace Dashboard</strong> â€” statistics of the workspace
 *       (owners et administrators).</li>
 *   <li><strong>Personal Dashboard</strong> â€” information related Ã  the user
 *       authenticated (dashboard par default after login).</li>
 *   <li><strong>Department Dashboard</strong> â€” information related Ã  a department
 *       specific (responsibles de department).</li>
 *   <li><strong>Project Dashboard</strong> â€” information related Ã  a project
 *       specific (members of the project).</li>
 * </ul>
 *
 * <p>All methods nÃ©cessitent un {@code workspaceId} in order to
 * preservesr la multi-tenantitÃ©. Aucune entity n'est exposede dans les
 * retours ; seuls des DTOs sont useds.</p>
 *
 * <p>Le contrat est conÃ§u to stay extensible : l'ajout futur de
 * widgets se fera par de nouvelthe methods sans modify les
 * signatures existantes.</p>
 *
 * <p><strong>Note :</strong> Les modules Reporting et Analytics ne
 * font pas partie de ce contrat. Ils seront implÃ©mentÃ©s
 * ultÃ©rieurement.</p>
 *
 * @see WorkspaceDashboardResponse
 * @see PersonalDashboardResponse
 * @see DepartmentDashboardResponse
 * @see ProjectDashboardResponse
 */
public interface DashboardService {

    // =========================================================================
    // Workspace Dashboard
    // =========================================================================

    /**
     * Returns the Workspace dashboard for the specified workspace.
     *
     * <p>This dashboard contains the global workspace statistics :
     * departments, teams, members, projects, tasks, notifications
     * and recent activities.</p>
     *
     * <p>Intended aux owners (OWNER) et administrators (ADMIN)
     * of the workspace.</p>
     *
     * @param workspaceId the ID of the workspace (multi-tenant)
     * @return le Workspace Dashboard complete
     */
    WorkspaceDashboardResponse getWorkspaceDashboard(UUID workspaceId);

    // =========================================================================
    // Personal Dashboard
    // =========================================================================

    /**
     * Returns the Personal Dashboard for the user authenticated
     * in the workspace specified.
     *
     * <p>Ce dashboard contains uniquement les information related Ã 
     * the authenticated user : ses projects, ses tasks, ses
     * notifications, ses mentions, ses comments recent, ses
     * documents, ses activitys et ses handovers du jour.</p>
     *
     * <p>This is the default dashboard displayed immediately
     * after login.</p>
     *
     * @param workspaceId      the ID of the workspace (multi-tenant)
     * @param authenticatedUserId l'identifiant de the authenticated user
     * @return le Personal Dashboard
     */
    PersonalDashboardResponse getPersonalDashboard(UUID workspaceId, UUID authenticatedUserId);

    // =========================================================================
    // Department Dashboard
    // =========================================================================

    /**
     * Returns the Department Dashboard pour the department specified
     * in the workspace donnÃ©.
     *
     * <p>This dashboard contains information related to a department
     * specific: its projects, its tasks, its members, its activities
     * and its notifications.</p>
     *
     * <p>Intended aux responsibles de department (MANAGER) ou Ã  all
     * member authorized of the workspace.</p>
     *
     * @param workspaceId  the ID of the workspace (multi-tenant)
     * @param departmentId the ID of the department
     * @return le Department Dashboard
     */
    DepartmentDashboardResponse getDepartmentDashboard(UUID workspaceId, UUID departmentId);

    // =========================================================================
    // Project Dashboard
    // =========================================================================

    /**
     * Returns the Project Dashboard pour the project specified dans le
     * workspace donnÃ©.
     *
     * <p>This dashboard contains information related to a project
     * specific: its progress, its tasks, its comments
     * recent, its attachments, its documents and its timeline
     * of activity.</p>
     *
     * <p>Intended aux members of the project.</p>
     *
     * @param workspaceId the ID of the workspace (multi-tenant)
     * @param projectId   the ID of the project
     * @return le Project Dashboard
     */
    ProjectDashboardResponse getProjectDashboard(UUID workspaceId, UUID projectId);

    // =========================================================================
    // Team Dashboard
    // =========================================================================

    /**
     * Returns the Team Dashboard pour the team specifiede
     * in the workspace donnÃ©.
     *
     * <p>This dashboard contains information related to a team
     * specific: overview, members, statistics, activities
     * of members, notifications and a feed of the parent workspace.</p>
     *
     * <p>Intended aux Team Leaders et Administrators of the workspace.</p>
     *
     * @param workspaceId the ID of the workspace (multi-tenant)
     * @param teamId      the ID of the team
     * @return le dashboard team
     */
    TeamDashboardResponse getTeamDashboard(UUID workspaceId, UUID teamId);
}
