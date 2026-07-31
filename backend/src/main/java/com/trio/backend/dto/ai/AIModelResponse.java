package com.trio.backend.dto.ai;

import com.trio.backend.enums.ModelStatus;
import com.trio.backend.enums.ModelType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class AIModelResponse {

    private UUID id;
    private UUID departmentId;
    private UUID projectId;
    private String projectName;
    private UUID teamId;
    private String teamName;
    private String name;
    private String description;
    private ModelType modelType;
    private String modelVersion;
    private String objective;
    private ModelStatus status;
    private Double accuracy;
    private UUID ownerId;
    private Instant createdAt;
    private Instant updatedAt;
}
