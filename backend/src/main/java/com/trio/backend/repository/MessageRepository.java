package com.trio.backend.repository;

import com.trio.backend.entity.Message;
import com.trio.backend.enums.MessageStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("""
            SELECT m FROM Message m
            JOIN FETCH m.sender
            WHERE m.conversation.id = :conversationId
            AND m.status = 'ACTIVE'
            ORDER BY m.createdAt DESC
            """)
    Page<Message> findByConversationId(
            @Param("conversationId") UUID conversationId,
            Pageable pageable
    );

    @Query("""
            SELECT m FROM Message m
            JOIN FETCH m.sender
            WHERE m.conversation.id = :conversationId
            AND m.id < :cursor
            AND m.status = 'ACTIVE'
            ORDER BY m.createdAt DESC
            """)
    Page<Message> findByConversationIdBeforeCursor(
            @Param("conversationId") UUID conversationId,
            @Param("cursor") UUID cursor,
            Pageable pageable
    );

    @Query("""
            SELECT m FROM Message m
            JOIN FETCH m.sender
            WHERE m.conversation.id = :conversationId
            AND m.isPinned = true
            AND m.status = 'ACTIVE'
            ORDER BY m.createdAt DESC
            """)
    List<Message> findPinnedMessages(@Param("conversationId") UUID conversationId);

    @Query("""
            SELECT m FROM Message m
            JOIN FETCH m.sender
            WHERE m.sender.id = :userId
            AND m.conversation.workspace.id = :workspaceId
            AND m.status = 'ACTIVE'
            ORDER BY m.createdAt DESC
            """)
    Page<Message> findBySenderId(
            @Param("userId") UUID userId,
            @Param("workspaceId") UUID workspaceId,
            Pageable pageable
    );

    @Query("""
            SELECT m FROM Message m
            JOIN FETCH m.sender
            WHERE m.conversation.id = :conversationId
            AND m.status = 'ACTIVE'
            AND m.messageType IN ('FILE', 'IMAGE')
            AND m.fileUrl IS NOT NULL
            ORDER BY m.createdAt DESC
            """)
    Page<Message> findFilesByConversation(
            @Param("conversationId") UUID conversationId,
            Pageable pageable
    );

    @Query("""
            SELECT m FROM Message m
            JOIN FETCH m.sender
            WHERE m.conversation.workspace.id = :workspaceId
            AND m.status = 'ACTIVE'
            AND m.messageType IN ('FILE', 'IMAGE')
            AND m.fileUrl IS NOT NULL
            ORDER BY m.createdAt DESC
            """)
    Page<Message> findFilesByWorkspace(
            @Param("workspaceId") UUID workspaceId,
            Pageable pageable
    );

    @Query("""
            SELECT m FROM Message m
            JOIN FETCH m.sender
            WHERE m.conversation.id = :conversationId
            AND m.status = 'ACTIVE'
            AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY m.createdAt DESC
            """)
    Page<Message> searchMessages(
            @Param("conversationId") UUID conversationId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            SELECT m FROM Message m
            JOIN FETCH m.sender
            WHERE m.conversation.workspace.id = :workspaceId
            AND m.status = 'ACTIVE'
            AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY m.createdAt DESC
            """)
    Page<Message> searchMessagesByWorkspace(
            @Param("workspaceId") UUID workspaceId,
            @Param("query") String query,
            Pageable pageable
    );

    long countByConversationIdAndStatus(UUID conversationId, MessageStatusEnum status);

    @Query("""
            SELECT COUNT(m) FROM Message m
            WHERE m.conversation.id = :conversationId
            AND m.status = 'ACTIVE'
            AND m.createdAt > :since
            """)
    long countUnreadSince(
            @Param("conversationId") UUID conversationId,
            @Param("since") Instant since
    );
}
