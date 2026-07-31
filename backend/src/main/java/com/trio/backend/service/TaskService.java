package com.trio.backend.service;

import com.trio.backend.dto.organisation.task.CreateTaskRequest;
import com.trio.backend.dto.organisation.task.TaskResponse;
import com.trio.backend.dto.organisation.task.UpdateTaskRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface TaskService {

    TaskResponse create(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            CreateTaskRequest request
    );

    TaskResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId
    );

    Page<TaskResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            String search,
            String statusFilter,
            String priorityFilter,
            UUID assigneeFilter,
            Pageable pageable
    );

    List<TaskResponse> listArchived(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId
    );

    TaskResponse update(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId,
            UpdateTaskRequest request
    );

    void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId
    );

    TaskResponse restore(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID taskId
    );
}
