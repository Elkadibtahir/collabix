package com.trio.backend.dto.hr;

import com.trio.backend.enums.OnboardingStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class OnboardingResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeNumber;
    private OnboardingStatus status;
    private LocalDate startDate;
    private LocalDate expectedCompletionDate;
    private LocalDate actualCompletionDate;
    private UUID assignedHrId;
    private UUID assignedManagerId;
    private String notes;
    private int completionPercentage;
    private int totalTasks;
    private int CompletedTasks;
    private Instant createdAt;
    private Instant updatedAt;
}
