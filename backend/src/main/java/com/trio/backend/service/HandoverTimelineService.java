package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.HandoverTimelineEventResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service for the HandoverEntry journal timeline.
 */
public interface HandoverTimelineService {

    List<HandoverTimelineEventResponse> list(UUID workspaceId, UUID handoverEntryId);
}
