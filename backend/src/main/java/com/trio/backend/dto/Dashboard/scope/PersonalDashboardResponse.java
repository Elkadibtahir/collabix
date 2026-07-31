package com.trio.backend.dto.Dashboard.scope;

import com.trio.backend.dto.Dashboard.scope.widget.*;
import com.trio.backend.dto.organisation.comment.CommentResponse;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Response du Personal Dashboard.
 *
 * <p>Ce DTO contains deux sections clearement separatedes :</p>
 * <ol>
 *   <li><strong>Personal Widgets</strong> Ã¢â‚¬â€ information propres ÃƒÂ 
 *       the authenticated user (tasks, notifications, mentions,
 *       comments, handovers, activitys).</li>
 *   <li><strong>Workspace Feed</strong> Ã¢â‚¬â€ flow of activity of the workspace
 *       (recent projects, documents, articles de knowledge lowe,
 *       activitys workspace).</li>
 * </ol>
 *
 * <p>The fields personnels sont honnÃƒÂªtes : si une feature
 * (comme l'assignation de tasks) is not encore implemented,
 * la value returnede est une list empty ou 0, avec un comment
 * explicite dans le code.</p>
 *
 * <p>Le Workspace Feed est explicitement namemÃƒÂ© to avoid alle
 * confusion avec des givens personnelles. Il s'agit of a vue
 * globale of the workspace, similaire ÃƒÂ  ce que Jira, Notion et Teams
 * affichent dans leur fil d'actualitÃƒÂ©.</p>
 *
 * @see PersonalTaskWidget
 * @see PersonalDocumentWidget
 * @see PersonalActivityWidget
 * @see PersonalHandoverWidget
 * @see PersonalProjectWidget
 * @see PersonalKnowledgeArticleWidget
 * @see MentionWidget
 * @see CommentResponse
 */
@Getter
@Setter
public class PersonalDashboardResponse {

    // =========================================================================
    // Personal Widgets Ã¢â‚¬â€ user-specific, honest
    // =========================================================================

    /**
     * Tasks personnelles.
     *
     * <p>Returns une list empty. L'assignation de tasks (TaskAssignment)
     * is not encore implemented. Cette feature sera addede
     * dans une version ultÃƒÂ©rieure.</p>
     */
    private List<PersonalTaskWidget> myTasks;

    /**
     * Nombre de tasks en delay for the user.
     *
     * <p>Returns 0. L'assignation de tasks n'ÃƒÂ©tant pas implemented,
     * aucune task personnelle en delay cannot ÃƒÂªtre dÃƒÂ©Completede.</p>
     */
    private long overdueTasks;

    /**
     * Nombre de notifications non lues for the user.
     */
    private long unreadNotifications;

    /**
     * List of mentions non lues oÃƒÂ¹ the user is referenced.
     */
    private List<MentionWidget> unreadMentions;

    /**
     * List of comments recent rÃƒÂ©digÃƒÂ©s by the user.
     */
    private List<CommentResponse> recentComments;

    /**
     * List of handovers (passations) du jour for the user.
     */
    private List<PersonalHandoverWidget> todaysHandovers;

    /**
     * List of activitys recents performed by the user.
     */
    private List<PersonalActivityWidget> recentActivities;

    // =========================================================================
    // Workspace Feed Ã¢â‚¬â€ flow of activity of the workspace
    // =========================================================================

    /**
     * Projects recent of the workspace (feed).
     *
     * <p>Remplace {@code myProjects} qui ÃƒÂ©tait trompeur tant que
     * l'belonging ÃƒÂ  a project (ProjectMember) is not implemented.</p>
     */
    private List<PersonalProjectWidget> recentWorkspaceProjects;

    /**
     * Documents recent of the workspace (feed).
     */
    private List<PersonalDocumentWidget> recentDocuments;

    /**
     * Articles de lowe de connaissances recent of the workspace (feed).
     */
    private List<PersonalKnowledgeArticleWidget> knowledgeArticles;

    /**
     * Activitys recents of the workspace (feed) Ã¢â‚¬â€ all users.
     */
    private List<RecentActivityWidget> workspaceActivities;
}

