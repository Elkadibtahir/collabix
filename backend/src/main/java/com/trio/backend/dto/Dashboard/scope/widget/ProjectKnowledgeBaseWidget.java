package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ProjectKnowledgeBaseWidget {

    private UUID id;

    private String title;

    private String category;

    private boolean isPinned;

    private Instant createdAt;
}
