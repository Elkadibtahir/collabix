package com.trio.backend.dto.organisation.checklist;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ChecklistResponse {
    private UUID id;
    private UUID taskId;
    private String title;
    private String status;
    private int totalItems;
    private int completedItems;
    private int completionPercentage;
    private List<ChecklistItemResponse> items;
    private Instant createdAt;
    private Instant updatedAt;
}
