package com.trio.backend.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;

    private final String message;

    private final T data;

    private final List<ApiError> errors;

    private final Instant timestamp;

    private ApiResponse(
            boolean success,
            String message,
            T data,
            List<ApiError> errors
    ) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.timestamp = Instant.now();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(
                true,
                message,
                data,
                null
        );
    }

    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(
                true,
                message,
                null,
                null
        );
    }

    public static <T> ApiResponse<T> failure(
            String message,
            List<ApiError> errors
    ) {
        return new ApiResponse<>(
                false,
                message,
                null,
                errors
        );
    }

    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(
                false,
                message,
                null,
                null
        );
    }
}