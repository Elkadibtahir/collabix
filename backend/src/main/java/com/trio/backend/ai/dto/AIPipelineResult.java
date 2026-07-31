package com.trio.backend.ai.dto;

import com.trio.backend.ai.enums.AIProvider;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class AIPipelineResult {

    private String finalResponse;

    @Builder.Default
    private List<ProviderExecution> providerExecutions = new ArrayList<>();

    private long totalExecutionTime;

    @Getter
    @Builder
    public static class ProviderExecution {

        private AIProvider provider;

        private String model;

        private String prompt;

        private String response;

        private long executionTime;

        private Integer tokenCount;

        private boolean success;

        private UUID historyId;
    }
}
