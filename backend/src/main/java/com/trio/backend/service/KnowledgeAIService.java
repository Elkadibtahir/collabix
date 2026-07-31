package com.trio.backend.service;

import com.trio.backend.dto.ai.KnowledgeAIResponse;
import com.trio.backend.dto.ai.KnowledgeSource;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface KnowledgeAIService {

    KnowledgeAIResponse ask(UUID workspaceId, UUID departmentId, UUID projectId, String question);

    List<KnowledgeSource> search(UUID workspaceId, UUID departmentId, UUID projectId, String query);

    Page<?> getHistory(UUID workspaceId, int page, int size);
}
