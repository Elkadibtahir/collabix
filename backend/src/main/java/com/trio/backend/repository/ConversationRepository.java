package com.trio.backend.repository;

import com.trio.backend.entity.Conversation;
import com.trio.backend.enums.ConversationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("""
            SELECT c FROM Conversation c
            JOIN c.workspace w
            WHERE c.id = :conversationId
            AND w.id = :workspaceId
            """)
    Optional<Conversation> findByIdAndWorkspace(
            @Param("conversationId") UUID conversationId,
            @Param("workspaceId") UUID workspaceId
    );

    @Query("""
            SELECT c FROM Conversation c
            WHERE c.workspace.id = :workspaceId
            AND c.isArchived = false
            AND c.type = :type
            ORDER BY c.lastMessageAt DESC NULLS LAST
            """)
    Page<Conversation> findByWorkspaceAndType(
            @Param("workspaceId") UUID workspaceId,
            @Param("type") ConversationType type,
            Pageable pageable
    );

    @Query("""
            SELECT c FROM Conversation c
            JOIN ConversationMember cm ON cm.conversation = c
            WHERE cm.user.id = :userId
            AND c.workspace.id = :workspaceId
            AND c.isArchived = false
            ORDER BY c.lastMessageAt DESC NULLS LAST
            """)
    Page<Conversation> findUserConversations(
            @Param("userId") UUID userId,
            @Param("workspaceId") UUID workspaceId,
            Pageable pageable
    );

    @Query("""
            SELECT c FROM Conversation c
            WHERE c.workspace.id = :workspaceId
            AND c.isArchived = false
            AND c.department.id = :departmentId
            AND c.type = 'DEPARTMENT'
            """)
    List<Conversation> findDepartmentConversations(
            @Param("workspaceId") UUID workspaceId,
            @Param("departmentId") UUID departmentId
    );

    @Query("""
            SELECT c FROM Conversation c
            WHERE c.workspace.id = :workspaceId
            AND c.isArchived = false
            AND c.team.id = :teamId
            AND c.type = 'TEAM'
            """)
    List<Conversation> findTeamConversations(
            @Param("workspaceId") UUID workspaceId,
            @Param("teamId") UUID teamId
    );

    @Query("""
            SELECT c FROM Conversation c
            WHERE c.workspace.id = :workspaceId
            AND c.type = 'WORKSPACE'
            AND c.isArchived = false
            """)
    List<Conversation> findWorkspaceDefaultConversations(
            @Param("workspaceId") UUID workspaceId
    );

    @Query("""
            SELECT c FROM Conversation c
            JOIN ConversationMember cm ON cm.conversation = c
            WHERE cm.user.id = :userId
            AND c.workspace.id = :workspaceId
            AND c.type = 'DIRECT'
            AND c.isArchived = false
            """)
    List<Conversation> findUserDirectConversations(
            @Param("userId") UUID userId,
            @Param("workspaceId") UUID workspaceId
    );

    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.workspace.id = :workspaceId AND c.isArchived = false")
    long countActiveByWorkspaceId(@Param("workspaceId") UUID workspaceId);
}
