package com.trio.backend.dto.ai;

import com.trio.backend.enums.ModelType;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UpdateAIModelRequest {

    private UUID teamId;
    private String name;
    private String description;
    private ModelType modelType;
    private String modelVersion;
    private String objective;
    private Double accuracy;
    private UUID ownerId;
}
