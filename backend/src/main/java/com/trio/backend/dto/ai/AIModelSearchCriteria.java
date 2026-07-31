package com.trio.backend.dto.ai;

import com.trio.backend.enums.ModelStatus;
import com.trio.backend.enums.ModelType;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AIModelSearchCriteria {

    private UUID projectId;
    private UUID teamId;
    private ModelStatus status;
    private ModelType modelType;
    private UUID ownerId;
    private String modelVersion;
    private String keyword;
}
