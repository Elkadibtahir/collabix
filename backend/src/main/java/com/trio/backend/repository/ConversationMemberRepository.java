package com.trio.backend.repository;

import com.trio.backend.entity.ConversationMember;
import com.trio.backend.entity.ids.ConversationMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, ConversationMemberId> {

    List<ConversationMember> findById_ConversationId(UUID conversationId);

    List<ConversationMember> findById_UserId(UUID userId);

    Optional<ConversationMember> findById_ConversationIdAndId_UserId(UUID conversationId, UUID userId);

    @Query("SELECT COUNT(cm) FROM ConversationMember cm WHERE cm.id.conversationId = :conversationId")
    long countByConversationId(@Param("conversationId") UUID conversationId);

    @Query("""
            SELECT cm FROM ConversationMember cm
            JOIN FETCH cm.user
            WHERE cm.id.conversationId = :conversationId
            ORDER BY cm.joinedAt ASC
            """)
    List<ConversationMember> findMembersWithUser(@Param("conversationId") UUID conversationId);

    boolean existsById_ConversationIdAndId_UserId(UUID conversationId, UUID userId);

    @Query("""
            SELECT cm FROM ConversationMember cm
            WHERE cm.id.userId = :userId
            AND cm.conversation.workspace.id = :workspaceId
            """)
    List<ConversationMember> findByUserIdAndWorkspace(
            @Param("userId") UUID userId,
            @Param("workspaceId") UUID workspaceId
    );
}
