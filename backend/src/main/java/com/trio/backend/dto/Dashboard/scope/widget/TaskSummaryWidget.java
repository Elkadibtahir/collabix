package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Summary widget of tasks pour le Workspace Dashboard.
 *
 * <p>Contient les statistics globales of tasks :
 * total, actives, archivedes, en delay, Ã©chÃ©ant today
 * et Ã©chÃ©ant cette week.</p>
 */
@Getter
@Setter
public class TaskSummaryWidget {

    /**
     * Nombre total de tasks.
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
     * Nombre de tasks Ã©chÃ©ant today.
     */
    private long tasksDueToday;

    /**
     * Nombre de tasks Ã©chÃ©ant cette week.
     */
    private long tasksDueThisWeek;
}

