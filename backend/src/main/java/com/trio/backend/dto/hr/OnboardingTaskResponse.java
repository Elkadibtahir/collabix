package com.trio.backend.dto.hr;

import com.trio.backend.enums.OnboardingTaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class OnboardingTaskResponse {

    private UUID id;
    private UUID onboardingId;
    private String title;
    private String description;
    private OnboardingTaskStatus status;
    private LocalDate dueDate;
    private LocalDate CompletedDate;
    private UUID assignedUserId;
    private String notes;
    private Integer taskOrder;
    private Instant createdAt;
    private Instant updatedAt;
}
