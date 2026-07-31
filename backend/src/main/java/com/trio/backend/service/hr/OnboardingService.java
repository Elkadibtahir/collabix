package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.CreateOnboardingRequest;
import com.trio.backend.dto.hr.CreateOnboardingTaskRequest;
import com.trio.backend.dto.hr.OnboardingResponse;
import com.trio.backend.dto.hr.OnboardingSearchCriteria;
import com.trio.backend.dto.hr.OnboardingStatistics;
import com.trio.backend.dto.hr.OnboardingTaskResponse;
import com.trio.backend.dto.hr.UpdateOnboardingRequest;
import com.trio.backend.dto.hr.UpdateOnboardingTaskRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface OnboardingService {

    OnboardingResponse create(UUID workspaceId, UUID departmentId, CreateOnboardingRequest request);

    OnboardingResponse getById(UUID workspaceId, UUID departmentId, UUID onboardingId);

    Page<OnboardingResponse> list(UUID workspaceId, UUID departmentId, OnboardingSearchCriteria criteria, Pageable pageable);

    OnboardingResponse update(UUID workspaceId, UUID departmentId, UUID onboardingId, UpdateOnboardingRequest request);

    void delete(UUID workspaceId, UUID departmentId, UUID onboardingId);

    OnboardingTaskResponse addTask(UUID workspaceId, UUID departmentId, UUID onboardingId, CreateOnboardingTaskRequest request);

    OnboardingTaskResponse updateTask(UUID workspaceId, UUID departmentId, UUID onboardingId, UUID taskId, UpdateOnboardingTaskRequest request);

    OnboardingTaskResponse CompleteTask(UUID workspaceId, UUID departmentId, UUID onboardingId, UUID taskId);

    OnboardingTaskResponse skipTask(UUID workspaceId, UUID departmentId, UUID onboardingId, UUID taskId);

    void deleteTask(UUID workspaceId, UUID departmentId, UUID onboardingId, UUID taskId);

    List<OnboardingTaskResponse> listTasks(UUID workspaceId, UUID departmentId, UUID onboardingId);

    OnboardingStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
