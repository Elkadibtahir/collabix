package com.trio.backend.ai.service;

import com.trio.backend.ai.dto.request.AIExecutionRequest;
import com.trio.backend.ai.dto.response.AIExecutionResponse;

public interface AIOrchestratorService {

    AIExecutionResponse execute(AIExecutionRequest request);
}
