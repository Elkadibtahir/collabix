package com.trio.backend.ai.dto.response;

import com.trio.backend.ai.enums.AIProvider;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class AIHistoryResponse {

    private UUID id;

    private UUID user;

    private UUID workspace;

    private UUID department;

    private AIProvider provider;

    private String model;

    private String prompt;

    private String response;

    private Long executionTime;

    private Integer tokenCount;

    private Boolean success;

    private Instant createdAt;
}
