package com.trio.backend.entity;

import com.trio.backend.entity.ids.ConversationMemberId;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
        name = "conversation_members",
        indexes = {
                @Index(name = "idx_cm_user_id", columnList = "user_id"),
                @Index(name = "idx_cm_conversation_id", columnList = "conversation_id")
        }
)
public class ConversationMember {

    @EmbeddedId
    private ConversationMemberId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("conversationId")
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @Column(name = "last_read_at")
    private Instant lastReadAt;

    @NotNull
    @Column(name = "role", nullable = false, length = 20)
    private String role = "MEMBER";

    @PrePersist
    private void prePersist() {
        if (joinedAt == null) {
            joinedAt = Instant.now();
        }
    }
}
