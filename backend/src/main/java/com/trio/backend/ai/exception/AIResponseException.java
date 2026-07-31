package com.trio.backend.ai.exception;

public class AIResponseException extends AIException {

    public AIResponseException(String message) {
        super(message);
    }

    public AIResponseException(String message, Throwable cause) {
        super(message, cause);
    }
}
