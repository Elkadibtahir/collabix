package com.trio.backend.dto.hr;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class EmployeeTimelineEntry {

    private UUID id;
    private String eventType;
    private String title;
    private String description;
    private Instant occurredAt;
    private UUID actorId;
    private String actorName;
}
