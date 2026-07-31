package com.trio.backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class KnowledgeSearchRequest {

    @NotNull
    private UUID workspaceId;

    @NotNull
    private UUID departmentId;

    private UUID projectId;

    @NotBlank
    private String query;

    private String category;

    private String documentType;
}
