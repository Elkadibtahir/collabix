package com.trio.backend.controller;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.ai.KnowledgeAIResponse;
import com.trio.backend.dto.ai.KnowledgeAskRequest;
import com.trio.backend.dto.ai.KnowledgeSearchRequest;
import com.trio.backend.dto.ai.KnowledgeSource;
import com.trio.backend.service.KnowledgeAIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge/ai")
@RequiredArgsConstructor
@Tag(name = "Knowledge AI", description = "AI-powered Knowledge Search and Question Answering")
@SecurityRequirement(name = "bearerAuth")
public class KnowledgeAIController {

    private final KnowledgeAIService knowledgeAIService;

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_READ')")
    @Operation(summary = "Ask a question to Knowledge AI")
    @PostMapping("/ask")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<KnowledgeAIResponse> ask(@Valid @RequestBody KnowledgeAskRequest request) {
        KnowledgeAIResponse response = knowledgeAIService.ask(
                request.getWorkspaceId(),
                request.getDepartmentId(),
                request.getProjectId(),
                request.getQuestion()
        );
        return ApiResponse.success("Question answered successfully.", response);
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_READ')")
    @Operation(summary = "Search documentation")
    @PostMapping("/search")
    public ApiResponse<List<KnowledgeSource>> search(@Valid @RequestBody KnowledgeSearchRequest request) {
        List<KnowledgeSource> results = knowledgeAIService.search(
                request.getWorkspaceId(),
                request.getDepartmentId(),
                request.getProjectId(),
                request.getQuery()
        );
        return ApiResponse.success("Search completed successfully.", results);
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'KNOWLEDGE_BASE_READ')")
    @Operation(summary = "Retrieve previous AI questions history")
    @GetMapping("/history")
    public ApiResponse<Page<?>> getHistory(
            @RequestParam UUID workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<?> history = knowledgeAIService.getHistory(workspaceId, page, size);
        return ApiResponse.success("History retrieved successfully.", history);
    }
}
