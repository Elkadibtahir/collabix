package com.trio.backend.dto.communication;

import com.trio.backend.enums.ConversationType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ConversationResponse {

    private UUID id;
    private UUID workspaceId;
    private String name;
    private String topic;
    private ConversationType type;
    private UUID departmentId;
    private UUID teamId;
    private boolean isPrivate;
    private boolean isArchived;
    private Instant lastMessageAt;
    private String lastMessagePreview;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;
    private long memberCount;
    private long unreadCount;
}
