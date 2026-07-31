package com.trio.backend.service;

import com.trio.backend.dto.organisation.activity.ActivityResponse;
import com.trio.backend.dto.organisation.activity.CreateActivityRequest;
import com.trio.backend.dto.organisation.activity.UpdateActivityRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Activity service contract (CRUD only).
 */
public interface ActivityService {

    ActivityResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            CreateActivityRequest request
    );

    ActivityResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID activityId
    );

    Page<ActivityResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            Pageable pageable
    );

    ActivityResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID activityId,
            UpdateActivityRequest request
    );

    void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UUID activityId
    );
}

