package com.trio.backend.dto.ai;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class KnowledgeSource {

    private UUID id;

    private String title;

    private String type;

    private String category;

    private String summary;

    private String workspaceName;

    private String departmentName;

    private String projectName;

    private Instant lastUpdated;

    private Integer version;
}
