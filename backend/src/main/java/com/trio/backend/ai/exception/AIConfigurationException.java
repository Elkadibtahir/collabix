package com.trio.backend.ai.exception;

public class AIConfigurationException extends AIException {

    public AIConfigurationException(String message) {
        super(message);
    }

    public AIConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}
