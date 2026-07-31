package com.trio.backend.service.dev;

import com.trio.backend.dto.dev.CreateSprintRequest;
import com.trio.backend.dto.dev.SprintResponse;
import com.trio.backend.dto.dev.SprintSearchCriteria;
import com.trio.backend.dto.dev.SprintStatistics;
import com.trio.backend.dto.dev.UpdateSprintRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SprintService {

    SprintResponse create(UUID workspaceId, UUID departmentId, CreateSprintRequest request);

    SprintResponse getById(UUID workspaceId, UUID departmentId, UUID sprintId);

    Page<SprintResponse> search(UUID workspaceId, UUID departmentId, SprintSearchCriteria criteria, Pageable pageable);

    SprintResponse update(UUID workspaceId, UUID departmentId, UUID sprintId, UpdateSprintRequest request);

    SprintResponse activate(UUID workspaceId, UUID departmentId, UUID sprintId);

    SprintResponse complete(UUID workspaceId, UUID departmentId, UUID sprintId);

    SprintResponse archive(UUID workspaceId, UUID departmentId, UUID sprintId);

    void delete(UUID workspaceId, UUID departmentId, UUID sprintId);

    SprintStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
