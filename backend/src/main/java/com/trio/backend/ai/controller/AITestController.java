package com.trio.backend.ai.controller;

import com.trio.backend.ai.dto.request.AIExecutionRequest;
import com.trio.backend.ai.dto.request.AITextRequest;
import com.trio.backend.ai.dto.response.AIExecutionResponse;
import com.trio.backend.ai.dto.response.AITextResponse;
import com.trio.backend.ai.enums.AITask;
import com.trio.backend.ai.service.AIOrchestratorService;
import com.trio.backend.ai.service.GeminiService;
import com.trio.backend.ai.service.GroqService;
import com.trio.backend.common.ApiResponse;
import com.trio.backend.exception.UnauthorizedException;
import com.trio.backend.util.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai/test")
@RequiredArgsConstructor
@Tag(name = "AI Test", description = "Temporary endpoints for AI provider integration testing")
public class AITestController {

    private static final UUID DEFAULT_WORKSPACE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID DEFAULT_DEPARTMENT_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private final GeminiService geminiService;
    private final GroqService groqService;
    private final AIOrchestratorService orchestratorService;

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'AI_MODEL_READ')")
    @PostMapping("/gemini")
    public ApiResponse<AITextResponse> testGemini(@Valid @RequestBody AITextRequest request) {
        UUID userId = getCurrentUserId();
        AITextResponse response = geminiService.generateText(request, userId, DEFAULT_WORKSPACE_ID, DEFAULT_DEPARTMENT_ID);
        return ApiResponse.success("Gemini test completed.", response);
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'AI_MODEL_READ')")
    @PostMapping("/groq")
    public ApiResponse<AITextResponse> testGroq(@Valid @RequestBody AITextRequest request) {
        UUID userId = getCurrentUserId();
        AITextResponse response = groqService.generateText(request, userId, DEFAULT_WORKSPACE_ID, DEFAULT_DEPARTMENT_ID);
        return ApiResponse.success("Groq test completed.", response);
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'AI_MODEL_READ')")
    @PostMapping("/chat")
    public ApiResponse<AIExecutionResponse> testChat(@Valid @RequestBody AITextRequest request) {
        AIExecutionRequest execRequest = buildExecutionRequest(AITask.GENERAL_CHAT, request);
        AIExecutionResponse response = orchestratorService.execute(execRequest);
        return ApiResponse.success("Chat orchestration test completed.", response);
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'AI_MODEL_READ')")
    @PostMapping("/analytics")
    public ApiResponse<AIExecutionResponse> testAnalytics(@Valid @RequestBody AITextRequest request) {
        AIExecutionRequest execRequest = buildExecutionRequest(AITask.ANALYTICS_SUMMARY, request);
        AIExecutionResponse response = orchestratorService.execute(execRequest);
        return ApiResponse.success("Analytics orchestration test completed.", response);
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'AI_MODEL_READ')")
    @PostMapping("/handover")
    public ApiResponse<AIExecutionResponse> testHandover(@Valid @RequestBody AITextRequest request) {
        AIExecutionRequest execRequest = buildExecutionRequest(AITask.HANDOVER_SUMMARY, request);
        AIExecutionResponse response = orchestratorService.execute(execRequest);
        return ApiResponse.success("Handover orchestration test completed.", response);
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'AI_MODEL_READ')")
    @PostMapping("/knowledge")
    public ApiResponse<AIExecutionResponse> testKnowledge(@Valid @RequestBody AITextRequest request) {
        AIExecutionRequest execRequest = buildExecutionRequest(AITask.KNOWLEDGE_SEARCH, request);
        AIExecutionResponse response = orchestratorService.execute(execRequest);
        return ApiResponse.success("Knowledge orchestration test completed.", response);
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'AI_MODEL_READ')")
    @PostMapping("/report")
    public ApiResponse<AIExecutionResponse> testReport(@Valid @RequestBody AITextRequest request) {
        AIExecutionRequest execRequest = buildExecutionRequest(AITask.REPORT_GENERATION, request);
        AIExecutionResponse response = orchestratorService.execute(execRequest);
        return ApiResponse.success("Report orchestration test completed.", response);
    }

    private AIExecutionRequest buildExecutionRequest(AITask task, AITextRequest textRequest) {
        UUID userId = getCurrentUserId();
        AIExecutionRequest execRequest = new AIExecutionRequest();
        execRequest.setTask(task);
        execRequest.setInput(textRequest.getPrompt());
        execRequest.setWorkspaceId(DEFAULT_WORKSPACE_ID);
        execRequest.setDepartmentId(DEFAULT_DEPARTMENT_ID);
        execRequest.setUserId(userId);
        return execRequest;
    }

    private UUID getCurrentUserId() {
        try {
            return SecurityUtils.getCurrentUserId();
        } catch (Exception e) {
            throw new UnauthorizedException("Authentication required.");
        }
    }
}
