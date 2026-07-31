package com.trio.backend.ai.dto.request;

import com.trio.backend.ai.enums.AITask;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
public class AIExecutionRequest {

    @NotNull
    private AITask task;

    @NotBlank
    private String input;

    @NotNull
    private UUID workspaceId;

    @NotNull
    private UUID departmentId;

    private UUID projectId;

    @NotNull
    private UUID userId;

    private Map<String, Object> context;
}
