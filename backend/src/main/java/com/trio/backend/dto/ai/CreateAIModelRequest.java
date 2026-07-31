package com.trio.backend.dto.ai;

import com.trio.backend.enums.ModelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateAIModelRequest {

    @NotNull
    private UUID projectId;

    private UUID teamId;

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 2000)
    private String description;

    @NotNull
    private ModelType modelType;

    @Size(max = 50)
    private String modelVersion;

    @Size(max = 500)
    private String objective;

    private Double accuracy;

    private UUID ownerId;
}
