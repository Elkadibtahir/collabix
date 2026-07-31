package com.trio.backend.ai.configuration;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "ai")
@Getter
@NoArgsConstructor
public class AIConfiguration {

    private final GeminiConfig gemini = new GeminiConfig();
    private final GroqConfig groq = new GroqConfig();

    @Getter
    public static class GeminiConfig {
        private String apiKey;
        private String model;
        private String url;

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    @Getter
    public static class GroqConfig {
        private String apiKey;
        private String model;
        private String url;

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

}
