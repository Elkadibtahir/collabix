package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.HandoverTimelineEventResponse;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.HandoverTimelineEventMapper;
import com.trio.backend.repository.HandoverEntryRepository;
import com.trio.backend.repository.HandoverTimelineEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Implementation for the HandoverEntry journal timeline.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class HandoverTimelineServiceImpl implements HandoverTimelineService {

    private final HandoverTimelineEventRepository timelineEventRepository;
    private final HandoverEntryRepository handoverEntryRepository;
    private final HandoverTimelineEventMapper timelineMapper;

    @Override
    @Transactional(readOnly = true)
    public List<HandoverTimelineEventResponse> list(UUID workspaceId, UUID handoverEntryId) {
        handoverEntryRepository.findByIdAndWorkspace(handoverEntryId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover not found."));
        return timelineEventRepository.findByHandoverEntryIdOrderByOccurredAtAsc(handoverEntryId).stream()
                .map(timelineMapper::toResponse)
                .toList();
    }
}
