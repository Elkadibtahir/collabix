package com.trio.backend.dto.organisation.handover;

import com.trio.backend.entity.HandoverEntry;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Create request of a HandoverEntry.
 */
@Getter
@Setter
public class CreateHandoverEntryRequest {

    @NotNull(message = "Department is required")
    private UUID departmentId;

    @NotNull(message = "Project is required")
    private UUID projectId;

    private UUID taskId;

    @NotNull(message = "Receiver is required")
    private UUID receiverId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Priority is required")
    private HandoverEntry.Priority priority;

    private LocalDateTime dueDate;
}
