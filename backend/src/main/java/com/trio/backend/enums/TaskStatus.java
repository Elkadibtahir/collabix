package com.trio.backend.enums;

public enum TaskStatus {
    ACTIVE,
    TODO,
    IN_PROGRESS,
    IN_REVIEW,
    BLOCKED,
    COMPLETED,
    ARCHIVED,
    CANCELLED;

    public boolean isTerminal() {
        return this == ARCHIVED || this == CANCELLED;
    }

    public boolean isActive() {
        return !isTerminal();
    }
}
