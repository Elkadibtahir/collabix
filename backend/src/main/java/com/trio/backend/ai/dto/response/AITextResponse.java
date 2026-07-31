package com.trio.backend.ai.dto.response;

import com.trio.backend.ai.enums.AIProvider;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AITextResponse {

    private AIProvider provider;

    private String model;

    private String response;

    private Long executionTime;

    private Integer tokenUsage;

    private Boolean success;
}
