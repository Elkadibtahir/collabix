package com.trio.backend.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AITextRequest {

    @NotBlank
    private String prompt;

    private Double temperature;

    private Integer maxTokens;

    private String systemPrompt;
}
