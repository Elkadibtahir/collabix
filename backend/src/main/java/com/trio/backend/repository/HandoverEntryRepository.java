package com.trio.backend.repository;

import com.trio.backend.entity.HandoverEntry;
import com.trio.backend.entity.HandoverEntry.HandoverEntryStatus;
import com.trio.backend.entity.HandoverEntry.Shift;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for HandoverEntry entity.
 *
 * <p>Conventions:</p>
 * <ul>
 *     <li>All queries filter by ACTIVE status by default.</li>
 *     <li>Workspace scope is validated through the entity chain: HandoverEntry -> Project/Department -> Workspace.</li>
 *     <li>Pagination is applied for list operations to ensure performance.</li>
 *     <li>Methods are designed to support future Gemini automation for HandoverJournal generation.</li>
 * </ul>
 */
@Repository
public interface HandoverEntryRepository extends JpaRepository<HandoverEntry, UUID> {

    // ==================== CRUD (scoped) ====================

    /**
     * Find a handover entry by ID within a specific workspace.
     */
    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.id = :handoverEntryId
              AND he.status = 'ACTIVE'
              AND he.workspace.id = :workspaceId
            """)
    Optional<HandoverEntry> findByIdAndWorkspace(
            @Param("handoverEntryId") UUID handoverEntryId,
            @Param("workspaceId") UUID workspaceId
    );

    // ==================== FIND BY WORKSPACE ====================

    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    Page<HandoverEntry> findByWorkspaceIdPaginated(
            @Param("workspaceId") UUID workspaceId,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(he) FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.status = 'ACTIVE'
            """)
    long countByWorkspace(@Param("workspaceId") UUID workspaceId);

    // ==================== FIND BY DEPARTMENT ====================

    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.department.id = :departmentId
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    Page<HandoverEntry> findByDepartmentIdPaginated(
            @Param("departmentId") UUID departmentId,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(he) FROM HandoverEntry he
            WHERE he.department.id = :departmentId
              AND he.status = 'ACTIVE'
            """)
    long countByDepartmentId(@Param("departmentId") UUID departmentId);

    // ==================== FIND BY PROJECT ====================

    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.project.id = :projectId
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    Page<HandoverEntry> findByProjectIdPaginated(
            @Param("projectId") UUID projectId,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(he) FROM HandoverEntry he
            WHERE he.project.id = :projectId
              AND he.status = 'ACTIVE'
            """)
    long countByProjectId(@Param("projectId") UUID projectId);

    // ==================== FIND BY USER ====================

    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.user.id = :userId
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    Page<HandoverEntry> findByUserIdPaginated(
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(he) FROM HandoverEntry he
            WHERE he.user.id = :userId
              AND he.status = 'ACTIVE'
            """)
    long countByUserId(@Param("userId") UUID userId);

    /**
     * Count active handover ensortes by a set of users in a workspace.
     */
    @Query("""
            SELECT COUNT(he) FROM HandoverEntry he
            WHERE he.user.id IN :userIds
              AND he.workspace.id = :workspaceId
              AND he.status = 'ACTIVE'
            """)
    long countByUserIdInAndWorkspaceId(
            @Param("userIds") List<UUID> userIds,
            @Param("workspaceId") UUID workspaceId
    );

    // ==================== FIND BY SHIFT ====================

    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.shift = :shift
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    Page<HandoverEntry> findByWorkspaceAndShiftPaginated(
            @Param("workspaceId") UUID workspaceId,
            @Param("shift") Shift shift,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(he) FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.shift = :shift
              AND he.status = 'ACTIVE'
            """)
    long countByWorkspaceAndShift(
            @Param("workspaceId") UUID workspaceId,
            @Param("shift") Shift shift
    );

    // ==================== FIND BY DATE ====================

    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.passedAt >= :from
              AND he.passedAt <= :to
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    Page<HandoverEntry> findByWorkspaceAndPassedAtBetweenPaginated(
            @Param("workspaceId") UUID workspaceId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(he) FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.passedAt >= :from
              AND he.passedAt <= :to
              AND he.status = 'ACTIVE'
            """)
    long countByWorkspaceAndPassedAtBetween(
            @Param("workspaceId") UUID workspaceId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    // ==================== DASHBOARD-SPECIFIC QUERIES ====================

    /**
     * Resorteves the handover ensortes of a user in a workspace for a period given.
     */
    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.user.id = :userId
              AND he.workspace.id = :workspaceId
              AND he.passedAt >= :from
              AND he.passedAt <= :to
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    List<HandoverEntry> findByUserIdAndWorkspaceAndPassedAtBetween(
            @Param("userId") UUID userId,
            @Param("workspaceId") UUID workspaceId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Resorteves the handover ensortes of a department for a period given.
     */
    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.department.id = :departmentId
              AND he.passedAt >= :from
              AND he.passedAt <= :to
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    List<HandoverEntry> findByDepartmentIdAndPassedAtBetween(
            @Param("departmentId") UUID departmentId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Resorteves the handover ensortes of a project for a period given.
     */
    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.project.id = :projectId
              AND he.passedAt >= :from
              AND he.passedAt <= :to
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    List<HandoverEntry> findByProjectIdAndPassedAtBetween(
            @Param("projectId") UUID projectId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

// ==================== DASHBOARD-SPECIFIC QUERIES ====================

    /**
     * Resorteves the handover ensortes of a user in a workspace for a period given,
     * with loading of the project associÃ©.
     *
     * <p>Utilise {@code JOIN FETCH} to avoid le N+1 sur {@code handoverEntry.project}
     * lors du mapping vers les widgets du dashboard personnel.</p>
     */
    @Query("""
            SELECT he FROM HandoverEntry he
            JOIN FETCH he.project
            WHERE he.user.id = :userId
              AND he.workspace.id = :workspaceId
              AND he.passedAt >= :from
              AND he.passedAt <= :to
              AND he.status = 'ACTIVE'
            ORDER BY he.passedAt DESC
            """)
    List<HandoverEntry> findByUserIdAndWorkspaceAndPassedAtBetweenWithProject(
            @Param("userId") UUID userId,
            @Param("workspaceId") UUID workspaceId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    // ==================== GEMINI / HandoverJournal PREP ====================

    /**
     * Fetch ACTIVE handover ensortes for a workspace in a time window.
     * Used as input for Gemini to generate future HandoverJournal.
     */
    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.status = 'ACTIVE'
              AND he.passedAt >= :from
              AND he.passedAt <= :to
            ORDER BY he.user.id ASC, he.passedAt DESC
            """)
    Page<HandoverEntry> findGeminiInputsByWorkspaceBetweenPaginated(
            @Param("workspaceId") UUID workspaceId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(he) FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.status = 'ACTIVE'
              AND he.passedAt >= :from
              AND he.passedAt <= :to
            """)
    long countGeminiInputsByWorkspaceBetween(
            @Param("workspaceId") UUID workspaceId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Fetch ACTIVE handover ensortes in a workspace that are ready for AI summary / RAG.
     * (aiProcessed = false indicates not yet summarized.)
     */
    @Query("""
            SELECT he FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.status = 'ACTIVE'
              AND he.aiProcessed = false
            ORDER BY he.passedAt ASC
            """)
    Page<HandoverEntry> findUnprocessedByAiPaginated(
            @Param("workspaceId") UUID workspaceId,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(he) FROM HandoverEntry he
            WHERE he.workspace.id = :workspaceId
              AND he.status = 'ACTIVE'
              AND he.aiProcessed = false
            """)
    long countUnprocessedByAi(@Param("workspaceId") UUID workspaceId);

    // ==================== SOFT DELETE (status updates) ====================

    @Query("""
            UPDATE HandoverEntry he
            SET he.status = 'DELETED'
            WHERE he.id = :handoverEntryId
              AND he.workspace.id = :workspaceId
            """)
    void softDelete(
            @Param("handoverEntryId") UUID handoverEntryId,
            @Param("workspaceId") UUID workspaceId
    );

    @Query("""
            UPDATE HandoverEntry he
            SET he.status = 'ARCHIVED'
            WHERE he.id = :handoverEntryId
              AND he.workspace.id = :workspaceId
            """)
    void archive(
            @Param("handoverEntryId") UUID handoverEntryId,
            @Param("workspaceId") UUID workspaceId
    );
}

