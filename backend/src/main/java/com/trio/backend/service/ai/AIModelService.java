package com.trio.backend.service.ai;

import com.trio.backend.dto.ai.AIModelResponse;
import com.trio.backend.dto.ai.AIModelSearchCriteria;
import com.trio.backend.dto.ai.AIModelStatistics;
import com.trio.backend.dto.ai.CreateAIModelRequest;
import com.trio.backend.dto.ai.UpdateAIModelRequest;

import java.util.List;
import java.util.UUID;

public interface AIModelService {

    AIModelResponse create(UUID departmentId, CreateAIModelRequest request);

    AIModelResponse update(UUID departmentId, UUID modelId, UpdateAIModelRequest request);

    AIModelResponse updateStatus(UUID departmentId, UUID modelId, String newStatus);

    AIModelResponse archive(UUID departmentId, UUID modelId);

    AIModelResponse findById(UUID departmentId, UUID modelId);

    List<AIModelResponse> findAllByDepartmentId(UUID departmentId);

    List<AIModelResponse> search(UUID departmentId, AIModelSearchCriteria criteria);

    AIModelStatistics getStatistics(UUID departmentId);
}
