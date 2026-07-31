package com.trio.backend.dto.organisation.checklist;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ChecklistItemResponse {
    private UUID id;
    private UUID checklistId;
    private String content;
    private boolean completed;
    private int sortOrder;
    private Instant createdAt;
    private Instant updatedAt;
}
