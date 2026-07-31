package com.trio.backend.dto.ai;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class HandoverAIGenerateRequest {

    @NotNull
    private UUID workspaceId;

    @NotNull
    private UUID departmentId;

    @NotNull
    private UUID projectId;
}
