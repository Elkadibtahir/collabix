package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.CreateHandoverEntryRequest;
import com.trio.backend.dto.organisation.handover.HandoverEntryResponse;
import com.trio.backend.dto.organisation.handover.UpdateHandoverEntryRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface HandoverEntryService {

    HandoverEntryResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            CreateHandoverEntryRequest request
    );

    HandoverEntryResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID handoverEntryId
    );

    Page<HandoverEntryResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            Pageable pageable
    );

    HandoverEntryResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID handoverEntryId,
            UpdateHandoverEntryRequest request
    );

    void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID handoverEntryId
    );
}

