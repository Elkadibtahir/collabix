package com.trio.backend.dto.communication;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateConversationRequest {

    @Size(max = 255)
    private String name;

    @Size(max = 500)
    private String topic;

    private Boolean isArchived;
}
