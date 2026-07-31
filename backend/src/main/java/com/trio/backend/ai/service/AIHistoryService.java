package com.trio.backend.ai.service;

import com.trio.backend.ai.dto.request.AIHistoryRequest;
import com.trio.backend.ai.dto.response.AIHistoryResponse;

import java.util.UUID;

public interface AIHistoryService {

    AIHistoryResponse create(AIHistoryRequest request);

    AIHistoryResponse findById(UUID id);
}
