package com.trio.backend.ai.service;

import com.trio.backend.ai.dto.response.AIPromptResponse;
import com.trio.backend.ai.enums.AIProvider;
import com.trio.backend.ai.enums.AITask;
import com.trio.backend.ai.exception.AIConfigurationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PromptBuilder {

    private final AIPromptService promptService;

    public String build(AITask task, AIProvider provider, String input, String previousOutput, Map<String, Object> context) {
        String promptCode = resolvePromptCode(task, provider);
        AIPromptResponse promptResponse = promptService.findByCode(promptCode);
        String template = promptResponse.getPromptTemplate();
        return substitute(template, input, previousOutput, context);
    }

    private String resolvePromptCode(AITask task, AIProvider provider) {
        return switch (provider) {
            case GEMINI -> task.name().toLowerCase() + "_analysis";
            case GROQ -> task.name().toLowerCase() + "_generation";
        };
    }

    private String substitute(String template, String input, String previousOutput, Map<String, Object> context) {
        String sanitizedInput = sanitizeUserInput(input != null ? input : "");
        String result = template.replace("{{input}}", sanitizedInput);
        result = result.replace("{{analysis}}", previousOutput != null ? previousOutput : "");
        result = result.replace("{{previous}}", previousOutput != null ? previousOutput : "");
        if (context != null) {
            for (Map.Entry<String, Object> entry : context.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue() != null ? entry.getValue().toString() : "";
                result = result.replace("{{" + key + "}}", value);
            }
        }
        return result;
    }

    private String sanitizeUserInput(String input) {
        if (input == null) return "";
        // Remove potentially dangerous prompt injection patterns
        String sanitized = input
                .replaceAll("(?i)ignore\\s+all\\s+(previous|above|prior)\\s+instructions", "")
                .replaceAll("(?i)forget\\s+all\\s+(previous|above|prior)", "")
                .replaceAll("(?i)disregard\\s+(previous|above|prior)", "")
                .replaceAll("(?i)system\\s+prompt", "")
                .replaceAll("(?i)new\\s+instructions?:", "")
                .replaceAll("\\{\\{[^}]+\\}\\}", "");
        return sanitized.trim();
    }
}
