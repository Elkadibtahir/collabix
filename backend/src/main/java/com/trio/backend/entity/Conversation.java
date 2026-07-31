package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.ConversationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        name = "conversations",
        indexes = {
                @Index(name = "idx_conversations_workspace_id", columnList = "workspace_id"),
                @Index(name = "idx_conversations_type", columnList = "type"),
                @Index(name = "idx_conversations_last_message_at", columnList = "last_message_at DESC"),
                @Index(name = "idx_conversations_workspace_type", columnList = "workspace_id, type"),
                @Index(name = "idx_conversations_is_archived", columnList = "is_archived")
        }
)
public class Conversation extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", length = 255)
    private String name;

    @Size(max = 500)
    @Column(name = "topic", length = 500)
    private String topic;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private ConversationType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate;

    @Column(name = "is_archived", nullable = false)
    private boolean isArchived;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Size(max = 500)
    @Column(name = "last_message_preview", length = 500)
    private String lastMessagePreview;
}
