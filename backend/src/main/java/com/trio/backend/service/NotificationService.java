package com.trio.backend.service;

import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.dto.notification.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for Notification CRUD operations.
 *
 * Notifications are a shared platform moduthe scoped to a Workspace.
 * Every notification belong to exactly one workspace and is addressed
 * to exactly one recipient user.
 */
public interface NotificationService {

    /**
     * Creates a nouvelle notification.
     *
     * @param workspaceId the ID of the workspace
     * @param request     les information de the notification
     * @return the notification createde
     */
    NotificationResponse create(UUID workspaceId, CreateNotificationRequest request);

    /**
     * Resorteves ae notification par its identifier.
     *
     * @param workspaceId    the ID of the workspace
     * @param notificationId l'identifiant de the notification
     * @return the notification found
     */
    NotificationResponse getById(UUID workspaceId, UUID notificationId);

    /**
     * Liste the notifications of a workspace destinÃ©es Ã  un user,
     * with pagination.
     *
     * @param workspaceId the ID of the workspace
     * @param recipientId l'identifiant de the user recipient
     * @param pageable    the parameters de pagination
     * @return une page de notifications
     */
    Page<NotificationResponse> list(UUID workspaceId, UUID recipientId, Pageable pageable);

    /**
     * Liste the notifications non lues of a workspace destinÃ©es Ã  un
     * user, with pagination.
     *
     * @param workspaceId the ID of the workspace
     * @param recipientId l'identifiant de the user recipient
     * @param pageable    the parameters de pagination
     * @return une page de notifications non lues
     */
    Page<NotificationResponse> listUnread(UUID workspaceId, UUID recipientId, Pageable pageable);

    /**
     * Marque une notification comme lue.
     *
     * @param workspaceId    the ID of the workspace
     * @param notificationId l'identifiant de the notification
     * @return the notification updated
     */
    NotificationResponse markAsRead(UUID workspaceId, UUID notificationId);

    /**
     * Marque all notifications of a user in a workspace
     * comme lues.
     *
     * @param workspaceId the ID of the workspace
     * @param recipientId l'identifiant de the user recipient
     */
    void markAllAsRead(UUID workspaceId, UUID recipientId);

    /**
     * Supprime (soft delete) une notification en changeant its status
     * vers {@code ARCHIVED}.
     *
     * @param workspaceId    the ID of the workspace
     * @param notificationId l'identifiant de the notification
     */
    void delete(UUID workspaceId, UUID notificationId);

    /**
     * Returns the namebre de notifications non lues pour un user
     * in a workspace.
     *
     * @param workspaceId the ID of the workspace
     * @param recipientId l'identifiant de the user recipient
     * @return the namebre de notifications non lues
     */
    long countUnread(UUID workspaceId, UUID recipientId);
}
