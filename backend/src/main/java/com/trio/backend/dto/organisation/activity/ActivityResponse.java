package com.trio.backend.dto.organisation.activity;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ActivityResponse {

    private UUID id;

    private UUID taskId;

    private UUID actorId;

    private String actorName;

    private String description;

    private String status;

    private Instant createdAt;
    private Instant updatedAt;
}

