package com.trio.backend.repository;

import com.trio.backend.entity.Attachment;
import com.trio.backend.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Attachment entity.
 *
 * <p>Conventions:</p>
 * <ul>
 *     <li>All queries filter by ACTIVE status by default.</li>
 *     <li>Workspace scope is validated through the entity chain: Attachment -> Task -> Project -> ... -> Workspace.</li>
 *     <li>Pagination is applied for list operations to ensure performance.</li>
 *     <li>Methods are designed to support future dashboard and statistics features.</li>
 * </ul>
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    // ==================== CRUD ====================

    /**
     * Find an attachment by ID within a specific workspace.
     * Validates workspace scope through the entity chain.
     */
    @Query("""
            SELECT a FROM Attachment a
            WHERE a.id = :attachmentId
            AND a.task.project.department.workspace.id = :workspaceId
            AND a.status = 'ACTIVE'
            """)
    Optional<Attachment> findByIdAndWorkspace(
            @Param("attachmentId") UUID attachmentId,
            @Param("workspaceId") UUID workspaceId
    );

    // ==================== FIND BY TASK ====================

    /**
     * Find all active attachments for a specific task.
     * Paginated for performance.
     */
    @Query("""
            SELECT a FROM Attachment a
            WHERE a.task.id = :taskId
            AND a.status = 'ACTIVE'
            ORDER BY a.createdAt DESC
            """)
    Page<Attachment> findByTaskIdPaginated(
            @Param("taskId") UUID taskId,
            Pageable pageable
    );

    /**
     * Find all active attachments for a specific task without pagination.
     * Useful for lightweight operations or export.
     */
    @Query("""
            SELECT a FROM Attachment a
            WHERE a.task.id = :taskId
            AND a.status = 'ACTIVE'
            ORDER BY a.createdAt DESC
            """)
    List<Attachment> findByTaskId(@Param("taskId") UUID taskId);

    /**
     * Count active attachments in a task.
     * Useful for task summary views and validation.
     */
    @Query("""
            SELECT COUNT(a) FROM Attachment a
            WHERE a.task.id = :taskId
            AND a.status = 'ACTIVE'
            """)
    long countByTaskId(@Param("taskId") UUID taskId);

    /**
     * Calculate total size of active attachments in a task.
     * Useful for storage quota management and reporting.
     */
    @Query("""
            SELECT COALESCE(SUM(a.fileSize), 0) FROM Attachment a
            WHERE a.task.id = :taskId
            AND a.status = 'ACTIVE'
            """)
    Long getTotalSizeByTaskId(@Param("taskId") UUID taskId);

    // ==================== FIND BY COMMENT ====================

    /**
     * Find all active attachments for a set of comment IDs.
     * Used for batch loading to prevent N+1 queries.
     */
    @Query("""
            SELECT a FROM Attachment a
            WHERE a.comment.id IN :commentIds
            AND a.status = 'ACTIVE'
            ORDER BY a.createdAt DESC
            """)
    List<Attachment> findByCommentIdIn(
            @Param("commentIds") List<UUID> commentIds
    );

    /**
     * Find all active attachments for a specific comment.
     * Paginated for performance.
     */
    @Query("""
            SELECT a FROM Attachment a
            WHERE a.comment.id = :commentId
            AND a.status = 'ACTIVE'
            ORDER BY a.createdAt DESC
            """)
    Page<Attachment> findByCommentIdPaginated(
            @Param("commentId") UUID commentId,
            Pageable pageable
    );

    /**
     * Find all active attachments for a specific comment without pagination.
     * Useful for lightweight operations or export.
     */
    @Query("""
            SELECT a FROM Attachment a
            WHERE a.comment.id = :commentId
            AND a.status = 'ACTIVE'
            ORDER BY a.createdAt DESC
            """)
    List<Attachment> findByCommentId(@Param("commentId") UUID commentId);

    /**
     * Count active attachments in a comment.
     * Useful for comment summary views and validation.
     */
    @Query("""
            SELECT COUNT(a) FROM Attachment a
            WHERE a.comment.id = :commentId
            AND a.status = 'ACTIVE'
            """)
    long countByCommentId(@Param("commentId") UUID commentId);

    /**
     * Calculate total size of active attachments in a comment.
     * Useful for storage quota management and reporting.
     */
    @Query("""
            SELECT COALESCE(SUM(a.fileSize), 0) FROM Attachment a
            WHERE a.comment.id = :commentId
            AND a.status = 'ACTIVE'
            """)
    Long getTotalSizeByCommentId(@Param("commentId") UUID commentId);

    // ==================== WORKSPACE SCOPE ====================

    /**
     * Find all active attachments within a workspace.
     * Paginated for performance.
     * Useful for workspace-wide audit or analytics.
     */
    @Query("""
            SELECT a FROM Attachment a
            WHERE a.task.project.department.workspace.id = :workspaceId
            AND a.status = 'ACTIVE'
            ORDER BY a.createdAt DESC
            """)
    Page<Attachment> findByWorkspacePaginated(
            @Param("workspaceId") UUID workspaceId,
            Pageable pageable
    );

    /**
     * Count all active attachments in a workspace.
     * Useful for quota checks and analytics.
     */
    @Query("""
            SELECT COUNT(a) FROM Attachment a
            WHERE a.task.project.department.workspace.id = :workspaceId
            AND a.status = 'ACTIVE'
            """)
    long countByWorkspace(@Param("workspaceId") UUID workspaceId);

    /**
     * Calculate total size of all active attachments in a workspace.
     * Essential for storage quota management.
     */
    @Query("""
            SELECT COALESCE(SUM(a.fileSize), 0) FROM Attachment a
            WHERE a.task.project.department.workspace.id = :workspaceId
            AND a.status = 'ACTIVE'
            """)
    Long getTotalSizeByWorkspace(@Param("workspaceId") UUID workspaceId);

    // ==================== STATISTICS & DASHBOARD ====================

    /**
     * Find all active attachments for a specific project.
     * Supports project-level dashboard and analytics.
     */
    @Query("""
            SELECT a FROM Attachment a
            WHERE a.task.project.id = :projectId
            AND a.status = 'ACTIVE'
            ORDER BY a.createdAt DESC
            """)
    Page<Attachment> findByProjectIdPaginated(
            @Param("projectId") UUID projectId,
            Pageable pageable
    );

    /**
     * Count active attachments in a project.
     * Useful for project dashboard metrics.
     */
    @Query("""
            SELECT COUNT(a) FROM Attachment a
            WHERE a.task.project.id = :projectId
            AND a.status = 'ACTIVE'
            """)
    long countByProjectId(@Param("projectId") UUID projectId);

    /**
     * Calculate total size of active attachments in a project.
     * Useful for project-level storage reporting.
     */
    @Query("""
            SELECT COALESCE(SUM(a.fileSize), 0) FROM Attachment a
            WHERE a.task.project.id = :projectId
            AND a.status = 'ACTIVE'
            """)
    Long getTotalSizeByProjectId(@Param("projectId") UUID projectId);

    /**
     * Find all active attachments for a specific department.
     * Supports department-level dashboard and analytics.
     */
    @Query("""
            SELECT a FROM Attachment a
            WHERE a.task.project.department.id = :departmentId
            AND a.status = 'ACTIVE'
            ORDER BY a.createdAt DESC
            """)
    Page<Attachment> findByDepartmentIdPaginated(
            @Param("departmentId") UUID departmentId,
            Pageable pageable
    );

    /**
     * Count active attachments in a department.
     * Useful for department dashboard metrics.
     */
    @Query("""
            SELECT COUNT(a) FROM Attachment a
            WHERE a.task.project.department.id = :departmentId
            AND a.status = 'ACTIVE'
            """)
    long countByDepartmentId(@Param("departmentId") UUID departmentId);

    /**
     * Calculate total size of active attachments in a department.
     * Useful for department-level storage reporting.
     */
    @Query("""
            SELECT COALESCE(SUM(a.fileSize), 0) FROM Attachment a
            WHERE a.task.project.department.id = :departmentId
            AND a.status = 'ACTIVE'
            """)
    Long getTotalSizeByDepartmentId(@Param("departmentId") UUID departmentId);

    // ==================== TEAM-SCOPED QUERIES ====================

    /**
     * Count active attachments uploaded by a set of users in a workspace.
     */
    @Query("""
            SELECT COUNT(a) FROM Attachment a
            WHERE a.createdBy IN :userIds
            AND a.task.project.department.workspace.id = :workspaceId
            AND a.status = 'ACTIVE'
            """)
    long countByCreatedByInAndWorkspaceIdAndStatus(
            @Param("userIds") List<UUID> userIds,
            @Param("workspaceId") UUID workspaceId,
            @Param("status") TaskStatus status
    );

    // ==================== SOFT DELETE ====================

    /**
     * Soft-delete an attachment by setting status to DELETED.
     * Used when an attachment needs to be logically removed without losing audit trail.
     */
    @Query("""
            UPDATE Attachment a
            SET a.status = 'DELETED'
            WHERE a.id = :attachmentId
            AND a.task.project.department.workspace.id = :workspaceId
            """)
    void softDelete(
            @Param("attachmentId") UUID attachmentId,
            @Param("workspaceId") UUID workspaceId
    );
}
