package com.trio.backend.ai.service;

import com.trio.backend.ai.dto.request.AIPromptRequest;
import com.trio.backend.ai.dto.response.AIPromptResponse;

import java.util.List;
import java.util.UUID;

public interface AIPromptService {

    AIPromptResponse create(AIPromptRequest request);

    AIPromptResponse findByCode(String code);

    AIPromptResponse findById(UUID id);

    List<AIPromptResponse> findAllActive();

    AIPromptResponse update(UUID id, AIPromptRequest request);

    void delete(UUID id);
}
