package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.MessageStatusEnum;
import com.trio.backend.enums.MessageType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        name = "messages",
        indexes = {
                @Index(name = "idx_messages_conversation_id", columnList = "conversation_id"),
                @Index(name = "idx_messages_sender_id", columnList = "sender_id"),
                @Index(name = "idx_messages_created_at", columnList = "created_at"),
                @Index(name = "idx_messages_is_pinned", columnList = "is_pinned"),
                @Index(name = "idx_messages_conversation_created", columnList = "conversation_id, created_at DESC"),
                @Index(name = "idx_messages_conversation_status", columnList = "conversation_id, status")
        }
)
public class Message extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id")
    private Message parentMessage;

    @NotBlank
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false, length = 20)
    private MessageType messageType = MessageType.TEXT;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MessageStatusEnum status = MessageStatusEnum.ACTIVE;

    @Size(max = 500)
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Size(max = 255)
    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Size(max = 100)
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "is_pinned")
    private boolean isPinned;

    @Column(name = "mentions", columnDefinition = "TEXT")
    private String mentions;
}
