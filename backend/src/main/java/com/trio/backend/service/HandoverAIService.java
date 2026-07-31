package com.trio.backend.service;

import com.trio.backend.dto.ai.HandoverAIEditRequest;
import com.trio.backend.dto.ai.HandoverAIResponse;

import java.util.UUID;

public interface HandoverAIService {

    HandoverAIResponse generate(UUID workspaceId, UUID departmentId, UUID projectId);

    HandoverAIResponse regenerate(UUID workspaceId, UUID departmentId, UUID projectId, UUID journalId);

    HandoverAIResponse edit(UUID workspaceId, UUID departmentId, UUID projectId, UUID journalId, HandoverAIEditRequest request);

    HandoverAIResponse approve(UUID workspaceId, UUID departmentId, UUID projectId, UUID journalId);

    HandoverAIResponse reject(UUID workspaceId, UUID departmentId, UUID projectId, UUID journalId);
}
