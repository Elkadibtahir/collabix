package com.trio.backend.ai.service;

import com.trio.backend.ai.dto.request.AITextRequest;
import com.trio.backend.ai.dto.response.AITextResponse;

import java.util.UUID;

public interface GeminiService {

    AITextResponse generateText(AITextRequest request, UUID userId, UUID workspaceId, UUID departmentId);
}
