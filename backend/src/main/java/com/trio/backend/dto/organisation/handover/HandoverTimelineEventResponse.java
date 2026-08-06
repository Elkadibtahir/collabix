package com.trio.backend.dto.organisation.handover;

import com.trio.backend.entity.HandoverTimelineEvent;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Response for a HandoverTimelineEvent (journal timeline entry).
 */
@Getter
@Setter
public class HandoverTimelineEventResponse {

    private UUID id;

    private UUID handoverEntryId;

    private HandoverTimelineEvent.TimelineEventType eventType;

    private String description;

    private UUID actorId;

    private Instant occurredAt;
}
