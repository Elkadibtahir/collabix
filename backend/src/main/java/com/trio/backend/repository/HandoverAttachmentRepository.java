package com.trio.backend.repository;

import com.trio.backend.entity.HandoverAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for the HandoverAttachment entity.
 */
@Repository
public interface HandoverAttachmentRepository extends JpaRepository<HandoverAttachment, UUID> {

    @Query("""
            SELECT a FROM HandoverAttachment a
            WHERE a.handoverEntry.id = :handoverEntryId
              AND a.handoverEntry.workspace.id = :workspaceId
            ORDER BY a.createdAt DESC
            """)
    List<HandoverAttachment> findByHandoverEntryIdAndWorkspaceId(
            @Param("handoverEntryId") UUID handoverEntryId,
            @Param("workspaceId") UUID workspaceId
    );

    @Query("""
            SELECT a FROM HandoverAttachment a
            WHERE a.id = :attachmentId
              AND a.handoverEntry.id = :handoverEntryId
              AND a.handoverEntry.workspace.id = :workspaceId
            """)
    Optional<HandoverAttachment> findByIdAndHandoverEntryIdAndWorkspaceId(
            @Param("attachmentId") UUID attachmentId,
            @Param("handoverEntryId") UUID handoverEntryId,
            @Param("workspaceId") UUID workspaceId
    );
}
