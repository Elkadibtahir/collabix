package com.trio.backend.ai.service.impl;

import com.trio.backend.ai.dto.request.AIHistoryRequest;
import com.trio.backend.ai.dto.response.AIHistoryResponse;
import com.trio.backend.ai.entity.AIHistory;
import com.trio.backend.ai.exception.AIException;
import com.trio.backend.ai.mapper.AIHistoryMapper;
import com.trio.backend.ai.repository.AIHistoryRepository;
import com.trio.backend.ai.service.AIHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AIHistoryServiceImpl implements AIHistoryService {

    private final AIHistoryRepository aiHistoryRepository;
    private final AIHistoryMapper aiHistoryMapper;

    @Override
    public AIHistoryResponse create(AIHistoryRequest request) {
        AIHistory entity = aiHistoryMapper.toEntity(request);
        AIHistory saved = aiHistoryRepository.save(entity);
        return aiHistoryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AIHistoryResponse findById(UUID id) {
        AIHistory entity = aiHistoryRepository.findById(id)
                .orElseThrow(() -> new AIException("AIHistory not found with id: " + id));
        return aiHistoryMapper.toResponse(entity);
    }
}
