package com.trio.backend.repository;

import com.trio.backend.entity.Announcement;
import com.trio.backend.enums.AnnouncementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {

    @Query("""
            SELECT a FROM Announcement a
            JOIN FETCH a.workspace w
            WHERE a.id = :announcementId
            AND w.id = :workspaceId
            AND a.status = 'ACTIVE'
            """)
    Optional<Announcement> findByIdAndWorkspace(
            @Param("announcementId") UUID announcementId,
            @Param("workspaceId") UUID workspaceId
    );

    @Query("""
            SELECT a FROM Announcement a
            WHERE a.workspace.id = :workspaceId
            AND a.status = 'ACTIVE'
            AND a.department IS NULL
            AND a.team IS NULL
            AND a.project IS NULL
            ORDER BY a.isPinned DESC, a.createdAt DESC
            """)
    Page<Announcement> findWorkspaceAnnouncements(
            @Param("workspaceId") UUID workspaceId,
            Pageable pageable
    );

    @Query("""
            SELECT a FROM Announcement a
            WHERE a.workspace.id = :workspaceId
            AND a.status = 'ACTIVE'
            AND (a.department.id = :departmentId OR a.department IS NULL)
            AND a.team IS NULL
            AND a.project IS NULL
            ORDER BY a.isPinned DESC, a.createdAt DESC
            """)
    Page<Announcement> findDepartmentAnnouncements(
            @Param("workspaceId") UUID workspaceId,
            @Param("departmentId") UUID departmentId,
            Pageable pageable
    );

    @Query("""
            SELECT a FROM Announcement a
            WHERE a.workspace.id = :workspaceId
            AND a.status = 'ACTIVE'
            AND (a.team.id = :teamId OR a.team IS NULL)
            AND a.project IS NULL
            ORDER BY a.isPinned DESC, a.createdAt DESC
            """)
    Page<Announcement> findTeamAnnouncements(
            @Param("workspaceId") UUID workspaceId,
            @Param("teamId") UUID teamId,
            Pageable pageable
    );

    @Query("""
            SELECT a FROM Announcement a
            WHERE a.workspace.id = :workspaceId
            AND a.status = 'ACTIVE'
            AND (a.project.id = :projectId OR a.project IS NULL)
            ORDER BY a.isPinned DESC, a.createdAt DESC
            """)
    Page<Announcement> findProjectAnnouncements(
            @Param("workspaceId") UUID workspaceId,
            @Param("projectId") UUID projectId,
            Pageable pageable
    );

    long countByWorkspaceIdAndStatus(UUID workspaceId, AnnouncementStatus status);
}
