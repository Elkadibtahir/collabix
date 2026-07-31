package com.trio.backend.ai.exception;

public class AIProviderException extends AIException {

    public AIProviderException(String message) {
        super(message);
    }

    public AIProviderException(String message, Throwable cause) {
        super(message, cause);
    }
}
