package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Summary widget of notifications pour le Workspace Dashboard.
 *
 * <p>Contient the namebre total de notifications, the namebre
 * de notifications non lues et the namebre de notifications
 * created today.</p>
 */
@Getter
@Setter
public class NotificationSummaryWidget {

    /**
     * Nombre total de notifications.
     */
    private long totalNotifications;

    /**
     * Nombre de notifications non lues.
     */
    private long unreadNotifications;

    /**
     * Nombre de notifications created today.
     */
    private long notificationsCreatedToday;
}

