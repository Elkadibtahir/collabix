package com.trio.backend.ai.controller;

import com.trio.backend.ai.dto.request.AIHistoryRequest;
import com.trio.backend.ai.dto.response.AIHistoryResponse;
import com.trio.backend.ai.service.AIHistoryService;
import com.trio.backend.common.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai/history")
@RequiredArgsConstructor
@Tag(name = "AI History", description = "Endpoints for AI interaction history")
@SecurityRequirement(name = "bearerAuth")
public class AIHistoryController {

    private final AIHistoryService aiHistoryService;

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'AI_MODEL_READ')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AIHistoryResponse> create(@Valid @RequestBody AIHistoryRequest request) {
        return ApiResponse.success("AI history recorded successfully.", aiHistoryService.create(request));
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'AI_MODEL_READ')")
    @GetMapping("/{id}")
    public ApiResponse<AIHistoryResponse> findById(@PathVariable UUID id) {
        return ApiResponse.success("AI history retrieved successfully.", aiHistoryService.findById(id));
    }
}
