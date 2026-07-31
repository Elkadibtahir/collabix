package com.trio.backend.repository;

import com.trio.backend.entity.Notification;
import com.trio.backend.entity.Notification.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for the Notification entity.
 *
 * <p>Conventions:</p>
 * <ul>
 *     <li>All read queries filter by UNREAD or READ status by default.</li>
 *     <li>ARCHIVED notifications are excludedded from default queries (soft-delete).</li>
 *     <li>Workspace scope is validated directly since Notification has a direct Workspace relationship.</li>
 *     <li>Pagination is applied for list operations to ensure performance.</li>
 *     <li>Methods are designed to support future cleanup, analytics, and dashboard features.</li>
 * </ul>
 */
public interface NotificationRepository extends JpaRepository<Notification, UUID>,
        JpaSpecificationExecutor<Notification> {

    // ==================== FIND BY RECIPIENT ====================

    /**
     * RÃƒÂ©cupÃƒÂ¨re all notifications of a recipient with pagination, ordered by creation date descending.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.status <> 'ARCHIVED' " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientId(
            @Param("recipientId") UUID recipientId,
            Pageable pageable
    );

    /**
     * RÃƒÂ©cupÃƒÂ¨re all notifications non archivÃƒÂ©es of a recipient.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.status <> 'ARCHIVED' " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findAllByRecipientId(
            @Param("recipientId") UUID recipientId
    );

    /**
     * Counts the namebre total de notifications non archivÃƒÂ©es of a recipient.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.status <> 'ARCHIVED'")
    long countByRecipientId(@Param("recipientId") UUID recipientId);

    /**
     * Counts the namebre total de notifications non archivÃƒÂ©es pour un ensemble de recipients.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.recipient.id IN :recipientIds " +
            "AND n.status <> 'ARCHIVED'")
    long countByRecipientIdIn(@Param("recipientIds") List<UUID> recipientIds);

    // ==================== UNREAD NOTIFICATIONS ====================

    /**
     * RÃƒÂ©cupÃƒÂ¨re the notifications non lues of a recipient with pagination, ordered by creation date descending.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.status = 'UNREAD' " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findUnreadByRecipientId(
            @Param("recipientId") UUID recipientId,
            Pageable pageable
    );

    /**
     * RÃƒÂ©cupÃƒÂ¨re all notifications non lues of a recipient.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.status = 'UNREAD' " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findAllUnreadByRecipientId(
            @Param("recipientId") UUID recipientId
    );

    /**
     * Counts the namebre de notifications non lues of a recipient.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.status = 'UNREAD'")
    long countUnreadByRecipientId(@Param("recipientId") UUID recipientId);

    /**
     * Counts the namebre de notifications non lues pour un ensemble de recipients in a workspace.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.recipient.id IN :recipientIds " +
            "AND n.workspace.id = :workspaceId " +
            "AND n.status = 'UNREAD'")
    long countUnreadByRecipientIdInAndWorkspaceId(
            @Param("recipientIds") List<UUID> recipientIds,
            @Param("workspaceId") UUID workspaceId
    );

    // ==================== READ NOTIFICATIONS ====================

    /**
     * RÃƒÂ©cupÃƒÂ¨re the notifications lues of a recipient with pagination, ordonnÃƒÂ©es by date de lecture dÃƒÂ©ascending.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.status = 'READ' " +
            "ORDER BY n.readAt DESC")
    Page<Notification> findReadByRecipientId(
            @Param("recipientId") UUID recipientId,
            Pageable pageable
    );

    /**
     * RÃƒÂ©cupÃƒÂ¨re all notifications lues of a recipient.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.status = 'READ' " +
            "ORDER BY n.readAt DESC")
    List<Notification> findAllReadByRecipientId(
            @Param("recipientId") UUID recipientId
    );

    // ==================== WORKSPACE SCOPE ====================

    /**
     * RÃƒÂ©cupÃƒÂ¨re all notifications non archivÃƒÂ©es of a workspace with pagination.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.workspace.id = :workspaceId " +
            "AND n.status <> 'ARCHIVED' " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByWorkspaceId(
            @Param("workspaceId") UUID workspaceId,
            Pageable pageable
    );

    /**
     * RÃƒÂ©cupÃƒÂ¨re all notifications non archivÃƒÂ©es of a workspace.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.workspace.id = :workspaceId " +
            "AND n.status <> 'ARCHIVED' " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findAllByWorkspaceId(
            @Param("workspaceId") UUID workspaceId
    );

    /**
     * RÃƒÂ©cupÃƒÂ¨re the notifications non archivÃƒÂ©es of a workspace pour un recipient spÃƒÂ©cifique with pagination.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.workspace.id = :workspaceId " +
            "AND n.recipient.id = :recipientId " +
            "AND n.status <> 'ARCHIVED' " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByWorkspaceIdAndRecipientId(
            @Param("workspaceId") UUID workspaceId,
            @Param("recipientId") UUID recipientId,
            Pageable pageable
    );

    /**
     * Counts the notifications non archivÃƒÂ©es of a workspace.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.workspace.id = :workspaceId " +
            "AND n.status <> 'ARCHIVED'")
    long countByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    /**
     * Counts the notifications non lues of a workspace.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.workspace.id = :workspaceId " +
            "AND n.status = 'UNREAD'")
    long countUnreadByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    // ==================== WORKSPACE DASHBOARD-SPECIFIC QUERIES ====================

    /**
     * Counts the notifications crÃƒÂ©ÃƒÂ©es today in a workspace.
     *
     * <p>Utilise la range schedule complÃƒÂ¨te du jour (startOfDay ÃƒÂ  endOfDay)
     * to filter the notifications crÃƒÂ©ÃƒÂ©es today.</p>
     *
     * @param workspaceId the ID of the workspace
     * @param startOfDay le dÃƒÂ©goal de la journÃƒÂ©e (00:00:00 UTC)
     * @param endOfDay la fin de la journÃƒÂ©e (23:59:59.999999999 UTC)
     * @return the namebre de notifications crÃƒÂ©ÃƒÂ©es today
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.workspace.id = :workspaceId " +
            "AND n.createdAt >= :startOfDay " +
            "AND n.createdAt <= :endOfDay")
    long countCreatedTodayByWorkspaceId(
            @Param("workspaceId") UUID workspaceId,
            @Param("startOfDay") Instant startOfDay,
            @Param("endOfDay") Instant endOfDay
    );

    // ==================== MARK AS READ ====================

    /**
     * Marque une notification spÃƒÂ©cifique comme lue pour un recipient donnÃƒÂ©.
     * VÃƒÂ©rifie que the notification belong bien au recipient.
     */
    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.status = 'READ', n.readAt = :now " +
            "WHERE n.id = :notificationId " +
            "AND n.recipient.id = :recipientId " +
            "AND n.status = 'UNREAD'")
    int markAsRead(
            @Param("notificationId") UUID notificationId,
            @Param("recipientId") UUID recipientId,
            @Param("now") Instant now
    );

    /**
     * Marque all notifications non lues of a recipient comme lues.
     */
    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.status = 'READ', n.readAt = :now " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.status = 'UNREAD'")
    int markAllAsRead(
            @Param("recipientId") UUID recipientId,
            @Param("now") Instant now
    );

    // ==================== RECIPIENT + WORKSPACE SCOPE (mark as read) ====================

    /**
     * Marque all notifications non lues of a recipient in a workspace comme lues.
     */
    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.status = 'READ', n.readAt = :now " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.workspace.id = :workspaceId " +
            "AND n.status = 'UNREAD'")
    int markAllAsReadByRecipientAndWorkspace(
            @Param("recipientId") UUID recipientId,
            @Param("workspaceId") UUID workspaceId,
            @Param("now") Instant now
    );

    // ==================== CLEANUP / ARCHIVE ====================

    /**
     * RÃƒÂ©cupÃƒÂ¨re the notifications lues antÃƒÂ©rieures ÃƒÂ  une date donnÃƒÂ©e, destinÃƒÂ©es au nettoyage.
     * UtilisÃƒÂ© par les tÃƒÂ¢ches planifiÃƒÂ©es d'archiving ou de purge.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.status = 'READ' " +
            "AND n.readAt < :before " +
            "ORDER BY n.readAt ASC")
    List<Notification> findReadBefore(
            @Param("before") Instant before
    );

    /**
     * RÃƒÂ©cupÃƒÂ¨re the notifications archivÃƒÂ©es antÃƒÂ©rieures ÃƒÂ  une date donnÃƒÂ©e, destinÃƒÂ©es ÃƒÂ  la purge dÃƒÂ©finitive.
     * UtilisÃƒÂ© par les tÃƒÂ¢ches planifiÃƒÂ©es de nettoyage.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.status = 'ARCHIVED' " +
            "AND (n.readAt IS NOT NULL AND n.readAt < :before) " +
            "ORDER BY n.readAt ASC")
    List<Notification> findArchivedBefore(
            @Param("before") Instant before
    );

    /**
     * Counts the notifications lues antÃƒÂ©rieures ÃƒÂ  une date donnÃƒÂ©e (for reporting de nettoyage).
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.status = 'READ' " +
            "AND n.readAt < :before")
    long countReadBefore(@Param("before") Instant before);

    /**
     * Counts the notifications archivÃƒÂ©es antÃƒÂ©rieures ÃƒÂ  une date donnÃƒÂ©e (for reporting de nettoyage).
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.status = 'ARCHIVED' " +
            "AND (n.readAt IS NOT NULL AND n.readAt < :before)")
    long countArchivedBefore(@Param("before") Instant before);

    // ==================== DEPARTMENT-SCOPED QUERIES ====================

    /**
     * RÃƒÂ©cupÃƒÂ¨re the notifications non archivÃƒÂ©es of a department (via the project associÃƒÂ©)
     * with pagination, ordered by creation date descending.
     *
     * <p>Le scope est validÃƒÂ© par la chaÃƒÂ®ne : Notification -> Project -> Department.</p>
     *
     * @param departmentId the ID of the department
     * @param pageable     les paramÃƒÂ¨tres de pagination
     * @return page de notifications du dÃƒÂ©partement
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.project.department.id = :departmentId " +
            "AND n.status <> 'ARCHIVED' " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByDepartmentIdPaginated(
            @Param("departmentId") UUID departmentId,
            Pageable pageable
    );

    /**
     * Counts all the notifications of a department (via the project associÃƒÂ©).
     *
     * @param departmentId the ID of the department
     * @return the namebre total de notifications
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.project.department.id = :departmentId")
    long countByDepartmentId(@Param("departmentId") UUID departmentId);

    /**
     * Counts the notifications non lues of a department (via the project associÃƒÂ©).
     *
     * @param departmentId the ID of the department
     * @return the namebre de notifications non lues
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.project.department.id = :departmentId " +
            "AND n.status = 'UNREAD'")
    long countUnreadByDepartmentId(@Param("departmentId") UUID departmentId);

    /**
     * Counts the notifications de type MENTION dans un dÃƒÂ©partement.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.project.department.id = :departmentId " +
            "AND n.notificationType = 'MENTION'")
    long countMentionsByDepartmentId(@Param("departmentId") UUID departmentId);

    // ==================== HR STATISTICS QUERIES ====================

    /**
     * Counts the notifications by status in a workspace.
     */
    @Query("SELECT n.status, COUNT(n) FROM Notification n WHERE n.workspace.id = :workspaceId GROUP BY n.status")
    List<Object[]> countByStatusGrouped(@Param("workspaceId") UUID workspaceId);

    /**
     * Counts the notifications by type in a workspace.
     */
    @Query("SELECT n.notificationType, COUNT(n) FROM Notification n WHERE n.workspace.id = :workspaceId GROUP BY n.notificationType")
    List<Object[]> countByTypeGrouped(@Param("workspaceId") UUID workspaceId);

    /**
     * Counts the notifications by type in a workspace pour les types HR.
     */
    @Query("SELECT n.notificationType, COUNT(n) FROM Notification n WHERE n.workspace.id = :workspaceId AND n.notificationType IN :types GROUP BY n.notificationType")
    List<Object[]> countByTypeGroupedFiltered(@Param("workspaceId") UUID workspaceId, @Param("types") List<Notification.NotificationType> types);

    /**
     * Counts the notifications by status in a workspace pour les types HR.
     */
    @Query("SELECT n.status, COUNT(n) FROM Notification n WHERE n.workspace.id = :workspaceId AND n.notificationType IN :types GROUP BY n.status")
    List<Object[]> countByStatusGroupedFiltered(@Param("workspaceId") UUID workspaceId, @Param("types") List<Notification.NotificationType> types);

    /**
     * Counts the notifications HR crÃƒÂ©ÃƒÂ©es today in a workspace.
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.workspace.id = :workspaceId AND n.notificationType IN :types AND n.createdAt >= :startOfDay AND n.createdAt <= :endOfDay")
    long countCreatedTodayByWorkspaceIdAndTypes(
            @Param("workspaceId") UUID workspaceId,
            @Param("types") List<Notification.NotificationType> types,
            @Param("startOfDay") Instant startOfDay,
            @Param("endOfDay") Instant endOfDay
    );

    // ==================== PROJECT-SCOPED QUERIES ====================

    /**
     * Counts the notifications de type MENTION in a project.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.project.id = :projectId " +
            "AND n.notificationType = 'MENTION'")
    long countMentionsByProjectId(@Param("projectId") UUID projectId);

    /**
     * Counts the notifications crÃƒÂ©ÃƒÂ©es today in a project.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.project.id = :projectId " +
            "AND n.createdAt >= :startOfDay " +
            "AND n.createdAt <= :endOfDay")
    long countCreatedTodayByProjectId(
            @Param("projectId") UUID projectId,
            @Param("startOfDay") Instant startOfDay,
            @Param("endOfDay") Instant endOfDay);

    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.project.id = :projectId")
    long countByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.project.id = :projectId " +
            "AND n.status = 'UNREAD'")
    long countUnreadByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT n FROM Notification n " +
            "WHERE n.project.id = :projectId " +
            "AND n.status <> 'ARCHIVED' " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByProjectIdPaginated(
            @Param("projectId") UUID projectId,
            Pageable pageable
    );

    // ==================== TYPE-BASED QUERIES ====================

    /**
     * RÃƒÂ©cupÃƒÂ¨re the notifications non archivÃƒÂ©es of a recipient filtrÃƒÂ©es by type with pagination.
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.notificationType = :type " +
            "AND n.status <> 'ARCHIVED' " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientIdAndType(
            @Param("recipientId") UUID recipientId,
            @Param("type") Notification.NotificationType type,
            Pageable pageable
    );

    /**
     * Counts the notifications non archivÃƒÂ©es of a recipient filtrÃƒÂ©es by type.
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.recipient.id = :recipientId " +
            "AND n.notificationType = :type " +
            "AND n.status <> 'ARCHIVED'")
    long countByRecipientIdAndType(
            @Param("recipientId") UUID recipientId,
            @Param("type") Notification.NotificationType type
    );

    // ==================== EXISTENCE CHECKS ====================

    /**
     * VÃƒÂ©rifie si une notification non lue existe pour un recipient donnÃƒÂ©.
     */
    boolean existsByIdAndRecipient_IdAndStatus(
            UUID notificationId,
            UUID recipientId,
            NotificationStatus status
    );
}
