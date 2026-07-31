package com.trio.backend.dto.Dashboard.scope;

import com.trio.backend.dto.Dashboard.scope.widget.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

/**
 * Response du Project Dashboard.
 *
 * <p>Ce DTO contains uniquement les information relatives Ã  un
 * project specific. Il est destinÃ© aux members of the project.</p>
 *
 * <p>Les information sont aggregated depuis les modules following :
 * Tasks, Comments, PiÃ¨ces jointes, Documents et Timeline
 * of activity of the project.</p>
 *
 * <p>Each section est encapsulated dans un sous-DTO (widget) pour
 * rester extensible sans impacter la structure globale.</p>
 *
 * @see ProjectProgressWidget
 * @see ProjectTaskWidget
 * @see ProjectCommentWidget
 * @see ProjectAttachmentWidget
 * @see ProjectDocumentWidget
 * @see ProjectActivityWidget
 */
@Getter
@Setter
public class ProjectDashboardResponse {

    /**
     * ID of the project.
     */
    private UUID projectId;

    /**
     * Nom of the project.
     */
    private String projectName;

    /**
     * Progression of the project (tasks totales, Completedes, pourcentage).
     */
    private ProjectProgressWidget projectProgress;

    /**
     * Liste of tasks of the project.
     */
    private List<ProjectTaskWidget> projectTasks;

    /**
     * Nombre de tasks en delay dans the project.
     */
    private long overdueTasks;

    /**
     * List of comments recent.
     */
    private List<ProjectCommentWidget> recentComments;

    /**
     * List of attachments.
     */
    private List<ProjectAttachmentWidget> attachments;

    /**
     * List of documents.
     */
    private List<ProjectDocumentWidget> documents;

    /**
     * Liste the articles Knowledge Lowe.
     */
    private List<ProjectKnowledgeBaseWidget> KnowledgeBaseArticles;

    /**
     * Timeline of activity of the project.
     */
    private List<ProjectActivityWidget> activityTimeline;
}

