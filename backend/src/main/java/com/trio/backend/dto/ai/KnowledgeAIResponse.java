package com.trio.backend.dto.ai;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class KnowledgeAIResponse {

    private String answer;

    private List<KnowledgeSource> sources;

    private String confidence;

    private String missingInformation;

    private List<String> suggestedRelatedDocuments;

    private Long executionTime;

    private Instant timestamp;
}
