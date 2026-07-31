package com.trio.backend.ai.service;

import com.trio.backend.ai.dto.AIPipelineResult;
import com.trio.backend.ai.dto.request.AIHistoryRequest;
import com.trio.backend.ai.dto.request.AITextRequest;
import com.trio.backend.ai.dto.response.AIHistoryResponse;
import com.trio.backend.ai.dto.response.AITextResponse;
import com.trio.backend.ai.enums.AIProvider;
import com.trio.backend.ai.enums.AITask;
import com.trio.backend.ai.exception.AIProviderException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PipelineExecutor {

    private final GeminiService geminiService;
    private final GroqService groqService;
    private final AIHistoryService aiHistoryService;

    private static final Map<AITask, List<AIProvider>> PIPELINES = new EnumMap<>(AITask.class);

    static {
        PIPELINES.put(AITask.GENERAL_CHAT, List.of(AIProvider.GROQ));

        List<AITask> dualProviderTasks = List.of(
                AITask.ANALYTICS_SUMMARY,
                AITask.ANALYTICS_INSIGHTS,
                AITask.ANALYTICS_RECOMMENDATIONS,
                AITask.HANDOVER_SUMMARY,
                AITask.HANDOVER_EXECUTIVE_REPORT,
                AITask.HANDOVER_RISK_ANALYSIS,
                AITask.HANDOVER_CONTINUITY,
                AITask.KNOWLEDGE_SEARCH,
                AITask.DOCUMENT_SUMMARY,
                AITask.DOCUMENT_EXPLANATION,
                AITask.REPORT_GENERATION,
                AITask.REPORT_SUMMARY,
                AITask.REPORT_EXECUTIVE_SUMMARY
        );

        for (AITask task : dualProviderTasks) {
            PIPELINES.put(task, List.of(AIProvider.GEMINI, AIProvider.GROQ));
        }
    }

    public List<AIProvider> getPipeline(AITask task) {
        List<AIProvider> pipeline = PIPELINES.get(task);
        if (pipeline == null) {
            throw new IllegalArgumentException("No pipeline defined for task: " + task);
        }
        return pipeline;
    }

    public AIPipelineResult execute(
            AITask task,
            String input,
            Map<String, Object> context,
            List<String> prompts,
            UUID userId,
            UUID workspaceId,
            UUID departmentId) {

        long totalStart = System.currentTimeMillis();
        List<AIProvider> pipeline = getPipeline(task);
        List<AIPipelineResult.ProviderExecution> executions = new ArrayList<>();
        String previousOutput = null;

        for (int i = 0; i < pipeline.size(); i++) {
            AIProvider provider = pipeline.get(i);
            String promptText = prompts.get(i);

            AITextRequest textRequest = new AITextRequest();
            textRequest.setPrompt(promptText);

            long stepStart = System.currentTimeMillis();
            AITextResponse providerResponse = callProvider(provider, textRequest, userId, workspaceId, departmentId);
            long stepTime = System.currentTimeMillis() - stepStart;

            AIHistoryRequest historyRequest = buildHistoryRequest(
                    provider, providerResponse, promptText, stepTime, userId, workspaceId, departmentId
            );
            AIHistoryResponse historyResponse = aiHistoryService.create(historyRequest);

            AIPipelineResult.ProviderExecution execution = AIPipelineResult.ProviderExecution.builder()
                    .provider(provider)
                    .model(providerResponse.getModel())
                    .prompt(promptText)
                    .response(providerResponse.getResponse())
                    .executionTime(stepTime)
                    .tokenCount(providerResponse.getTokenUsage())
                    .success(providerResponse.getSuccess())
                    .historyId(historyResponse.getId())
                    .build();
            executions.add(execution);

            previousOutput = providerResponse.getResponse();
        }

        long totalTime = System.currentTimeMillis() - totalStart;

        return AIPipelineResult.builder()
                .finalResponse(previousOutput)
                .providerExecutions(executions)
                .totalExecutionTime(totalTime)
                .build();
    }

    private AITextResponse callProvider(AIProvider provider, AITextRequest request,
                                         UUID userId, UUID workspaceId, UUID departmentId) {
        return switch (provider) {
            case GEMINI -> geminiService.generateText(request, userId, workspaceId, departmentId);
            case GROQ -> groqService.generateText(request, userId, workspaceId, departmentId);
        };
    }

    private AIHistoryRequest buildHistoryRequest(AIProvider provider, AITextResponse providerResponse,
                                                  String prompt, long executionTime,
                                                  UUID userId, UUID workspaceId, UUID departmentId) {
        AIHistoryRequest historyRequest = new AIHistoryRequest();
        historyRequest.setUser(userId);
        historyRequest.setWorkspace(workspaceId);
        historyRequest.setDepartment(departmentId);
        historyRequest.setProvider(provider);
        historyRequest.setModel(providerResponse.getModel());
        historyRequest.setPrompt(prompt);
        historyRequest.setResponse(providerResponse.getResponse());
        historyRequest.setExecutionTime(executionTime);
        historyRequest.setTokenCount(providerResponse.getTokenUsage());
        historyRequest.setSuccess(providerResponse.getSuccess());
        return historyRequest;
    }
}
