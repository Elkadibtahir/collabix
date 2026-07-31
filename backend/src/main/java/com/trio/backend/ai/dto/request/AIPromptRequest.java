package com.trio.backend.ai.dto.request;

import com.trio.backend.ai.enums.AIPromptCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AIPromptRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    @NotNull
    private AIPromptCategory category;

    @NotBlank
    private String promptTemplate;

    @NotNull
    private Boolean active;

    private String description;
}
