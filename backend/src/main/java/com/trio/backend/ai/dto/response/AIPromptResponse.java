package com.trio.backend.ai.dto.response;

import com.trio.backend.ai.enums.AIPromptCategory;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class AIPromptResponse {

    private UUID id;

    private String code;

    private String name;

    private AIPromptCategory category;

    private String promptTemplate;

    private Boolean active;

    private String description;

    private Instant createdAt;

    private Instant updatedAt;
}
