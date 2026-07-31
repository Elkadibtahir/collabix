package com.trio.backend.repository;

import com.trio.backend.entity.UserHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface UserHistoryRepository extends JpaRepository<UserHistory, UUID>, JpaSpecificationExecutor<UserHistory> {

    @Query("SELECT h.action, COUNT(h) FROM UserHistory h WHERE h.workspace.id = :workspaceId GROUP BY h.action")
    List<Object[]> countByActionGrouped(@Param("workspaceId") UUID workspaceId);

    @Query("SELECT h.performedBy.id, COUNT(h) FROM UserHistory h WHERE h.workspace.id = :workspaceId GROUP BY h.performedBy.id ORDER BY COUNT(h) DESC")
    List<Object[]> countByPerformedByGrouped(@Param("workspaceId") UUID workspaceId);

    @Query("SELECT COUNT(h) FROM UserHistory h WHERE h.workspace.id = :workspaceId AND h.createdAt >= :since")
    long countByWorkspaceIdAndCreatedAtAfter(@Param("workspaceId") UUID workspaceId, @Param("since") Instant since);

    @Query("SELECT COUNT(h) FROM UserHistory h WHERE h.workspace.id = :workspaceId AND h.action = :action")
    long countByWorkspaceIdAndAction(@Param("workspaceId") UUID workspaceId, @Param("action") String action);

}
