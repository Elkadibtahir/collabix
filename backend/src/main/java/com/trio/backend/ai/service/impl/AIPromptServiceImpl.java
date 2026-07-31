package com.trio.backend.ai.service.impl;

import com.trio.backend.ai.dto.request.AIPromptRequest;
import com.trio.backend.ai.dto.response.AIPromptResponse;
import com.trio.backend.ai.entity.AIPrompt;
import com.trio.backend.ai.exception.AIException;
import com.trio.backend.ai.mapper.AIPromptMapper;
import com.trio.backend.ai.repository.AIPromptRepository;
import com.trio.backend.ai.service.AIPromptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AIPromptServiceImpl implements AIPromptService {

    private final AIPromptRepository aiPromptRepository;
    private final AIPromptMapper aiPromptMapper;

    @Override
    public AIPromptResponse create(AIPromptRequest request) {
        if (aiPromptRepository.existsByCode(request.getCode())) {
            throw new AIException("AIPrompt with code '" + request.getCode() + "' already exists.");
        }
        AIPrompt entity = aiPromptMapper.toEntity(request);
        AIPrompt saved = aiPromptRepository.save(entity);
        return aiPromptMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AIPromptResponse findByCode(String code) {
        AIPrompt entity = aiPromptRepository.findByCode(code)
                .orElseThrow(() -> new AIException("AIPrompt not found with code: " + code));
        return aiPromptMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public AIPromptResponse findById(UUID id) {
        AIPrompt entity = aiPromptRepository.findById(id)
                .orElseThrow(() -> new AIException("AIPrompt not found with id: " + id));
        return aiPromptMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AIPromptResponse> findAllActive() {
        return aiPromptRepository.findAll().stream()
                .filter(AIPrompt::getActive)
                .map(aiPromptMapper::toResponse)
                .toList();
    }

    @Override
    public AIPromptResponse update(UUID id, AIPromptRequest request) {
        AIPrompt entity = aiPromptRepository.findById(id)
                .orElseThrow(() -> new AIException("AIPrompt not found with id: " + id));

        if (!entity.getCode().equals(request.getCode()) && aiPromptRepository.existsByCode(request.getCode())) {
            throw new AIException("AIPrompt with code '" + request.getCode() + "' already exists.");
        }

        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setCategory(request.getCategory());
        entity.setPromptTemplate(request.getPromptTemplate());
        entity.setActive(request.getActive());
        entity.setDescription(request.getDescription());

        AIPrompt saved = aiPromptRepository.save(entity);
        return aiPromptMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID id) {
        if (!aiPromptRepository.existsById(id)) {
            throw new AIException("AIPrompt not found with id: " + id);
        }
        aiPromptRepository.deleteById(id);
    }
}
