package com.trio.backend.ai.exception;

public class AIConnectionException extends AIException {

    public AIConnectionException(String message) {
        super(message);
    }

    public AIConnectionException(String message, Throwable cause) {
        super(message, cause);
    }
}
