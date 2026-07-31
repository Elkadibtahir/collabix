package com.trio.backend.ai.service.impl;

import com.trio.backend.ai.configuration.AIConfiguration;
import com.trio.backend.ai.dto.request.AIHistoryRequest;
import com.trio.backend.ai.dto.request.AITextRequest;
import com.trio.backend.ai.dto.response.AITextResponse;
import com.trio.backend.ai.enums.AIProvider;
import com.trio.backend.ai.exception.AIConnectionException;
import com.trio.backend.ai.exception.AIConfigurationException;
import com.trio.backend.ai.exception.AIProviderException;
import com.trio.backend.ai.exception.AIResponseException;
import com.trio.backend.ai.service.AIHistoryService;
import com.trio.backend.ai.service.GroqService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroqServiceImpl implements GroqService {

    private final RestClient restClient;
    private final AIConfiguration configuration;
    private final AIHistoryService aiHistoryService;

    @Override
    public AITextResponse generateText(AITextRequest request, UUID userId, UUID workspaceId, UUID departmentId) {
        String apiKey = configuration.getGroq().getApiKey();
        String model = configuration.getGroq().getModel();
        String baseUrl = configuration.getGroq().getUrl();

        if (apiKey == null || apiKey.isBlank()) {
            throw new AIConfigurationException("Groq API key is not configured");
        }
        if (model == null || model.isBlank()) {
            throw new AIConfigurationException("Groq model is not configured");
        }

        String url = baseUrl + "/openai/v1/chat/completions";

        Map<String, Object> message = new java.util.HashMap<>();
        message.put("role", "user");
        message.put("content", request.getPrompt());

        if (request.getSystemPrompt() != null && !request.getSystemPrompt().isBlank()) {
            Map<String, Object> systemMessage = new java.util.HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", request.getSystemPrompt());
            message = Map.of("role", "user", "content", request.getPrompt());
            Map<String, Object> requestBody = new java.util.HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(systemMessage, message));
            if (request.getTemperature() != null) {
                requestBody.put("temperature", request.getTemperature());
            }
            if (request.getMaxTokens() != null) {
                requestBody.put("max_tokens", request.getMaxTokens());
            }

            return executeCall(url, apiKey, request, requestBody, userId, workspaceId, departmentId);
        }

        Map<String, Object> requestBody = new java.util.HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(message));
        if (request.getTemperature() != null) {
            requestBody.put("temperature", request.getTemperature());
        }
        if (request.getMaxTokens() != null) {
            requestBody.put("max_tokens", request.getMaxTokens());
        }

        return executeCall(url, apiKey, request, requestBody, userId, workspaceId, departmentId);
    }

    private AITextResponse executeCall(String url, String apiKey, AITextRequest request,
                                        Map<String, Object> requestBody,
                                        UUID userId, UUID workspaceId, UUID departmentId) {
        String model = configuration.getGroq().getModel();
        long start = System.currentTimeMillis();

        try {
            Map response = restClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            long executionTime = System.currentTimeMillis() - start;

            if (response == null) {
                throw new AIResponseException("Groq returned null response");
            }

            if (response.containsKey("error")) {
                Map error = (Map) response.get("error");
                String message = error != null ? (String) error.get("message") : "Unknown error";
                throw new AIProviderException("Groq API error: " + message);
            }

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new AIResponseException("Groq returned no choices");
            }

            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> responseMessage = (Map<String, Object>) firstChoice.get("message");
            if (responseMessage == null) {
                throw new AIResponseException("Groq response missing message");
            }
            String text = (String) responseMessage.get("content");
            if (text == null) {
                throw new AIResponseException("Groq response missing content");
            }

            Integer tokenCount = null;
            Map<String, Object> usage = (Map<String, Object>) response.get("usage");
            if (usage != null) {
                Object totalTokens = usage.get("total_tokens");
                if (totalTokens instanceof Number) {
                    tokenCount = ((Number) totalTokens).intValue();
                }
            }

            recordHistory(model, request.getPrompt(), text, executionTime, tokenCount, true, userId, workspaceId, departmentId);

            return AITextResponse.builder()
                    .provider(AIProvider.GROQ)
                    .model(model)
                    .response(text)
                    .executionTime(executionTime)
                    .tokenUsage(tokenCount)
                    .success(true)
                    .build();

        } catch (AIConfigurationException | AIProviderException | AIResponseException e) {
            throw e;
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - start;
            recordHistory(model, request.getPrompt(), e.getMessage(), executionTime, null, false, userId, workspaceId, departmentId);
            throw new AIConnectionException("Failed to call Groq API: " + e.getMessage(), e);
        }
    }

    private void recordHistory(String model, String prompt, String response, long executionTime,
                                Integer tokenCount, boolean success, UUID userId, UUID workspaceId, UUID departmentId) {
        AIHistoryRequest historyRequest = new AIHistoryRequest();
        historyRequest.setUser(userId);
        historyRequest.setWorkspace(workspaceId);
        historyRequest.setDepartment(departmentId);
        historyRequest.setProvider(AIProvider.GROQ);
        historyRequest.setModel(model);
        historyRequest.setPrompt(prompt);
        historyRequest.setResponse(response);
        historyRequest.setExecutionTime(executionTime);
        historyRequest.setTokenCount(tokenCount);
        historyRequest.setSuccess(success);
        aiHistoryService.create(historyRequest);
    }
}
