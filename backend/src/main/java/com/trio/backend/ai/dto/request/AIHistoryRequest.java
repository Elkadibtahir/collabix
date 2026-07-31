package com.trio.backend.ai.dto.request;

import com.trio.backend.ai.enums.AIProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AIHistoryRequest {

    @NotNull
    private UUID user;

    @NotNull
    private UUID workspace;

    @NotNull
    private UUID department;

    @NotNull
    private AIProvider provider;

    @NotBlank
    private String model;

    @NotBlank
    private String prompt;

    @NotBlank
    private String response;

    @NotNull
    private Long executionTime;

    private Integer tokenCount;

    @NotNull
    private Boolean success;
}
