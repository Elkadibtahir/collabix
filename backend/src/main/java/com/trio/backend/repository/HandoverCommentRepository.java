package com.trio.backend.repository;

import com.trio.backend.entity.HandoverComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for the HandoverComment entity.
 */
@Repository
public interface HandoverCommentRepository extends JpaRepository<HandoverComment, UUID> {

    @Query("""
            SELECT c FROM HandoverComment c
            WHERE c.handoverEntry.id = :handoverEntryId
              AND c.handoverEntry.workspace.id = :workspaceId
            ORDER BY c.createdAt ASC
            """)
    List<HandoverComment> findByHandoverEntryIdAndWorkspaceId(
            @Param("handoverEntryId") UUID handoverEntryId,
            @Param("workspaceId") UUID workspaceId
    );

    @Query("""
            SELECT c FROM HandoverComment c
            WHERE c.id = :commentId
              AND c.handoverEntry.id = :handoverEntryId
              AND c.handoverEntry.workspace.id = :workspaceId
            """)
    Optional<HandoverComment> findByIdAndHandoverEntryIdAndWorkspaceId(
            @Param("commentId") UUID commentId,
            @Param("handoverEntryId") UUID handoverEntryId,
            @Param("workspaceId") UUID workspaceId
    );
}
