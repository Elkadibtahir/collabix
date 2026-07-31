package com.trio.backend.dto.communication;

import com.trio.backend.enums.MessageStatusEnum;
import com.trio.backend.enums.MessageType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class MessageResponse {

    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String senderFirstName;
    private String senderLastName;
    private String senderProfilePicture;
    private UUID parentMessageId;
    private String content;
    private MessageType messageType;
    private MessageStatusEnum status;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private boolean isPinned;
    private String mentions;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;
}
