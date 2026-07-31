package com.trio.backend.dto.communication;

import com.trio.backend.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateMessageRequest {

    @NotBlank
    private String content;

    private MessageType messageType;

    private UUID parentMessageId;

    @Size(max = 500)
    private String fileUrl;

    @Size(max = 255)
    private String fileName;

    private Long fileSize;

    @Size(max = 100)
    private String mimeType;

    private boolean isPinned;

    private String mentions;
}
