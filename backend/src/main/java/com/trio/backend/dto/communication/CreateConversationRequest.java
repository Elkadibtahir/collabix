package com.trio.backend.dto.communication;

import com.trio.backend.enums.ConversationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
public class CreateConversationRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 500)
    private String topic;

    @NotNull
    private ConversationType type;

    private UUID departmentId;

    private UUID teamId;

    private boolean isPrivate;

    private Set<UUID> memberIds;
}
