package com.trio.backend.dto.hr;

import com.trio.backend.enums.OnboardingTaskStatus;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class UpdateOnboardingTaskRequest {

    @Size(max = 255)
    private String title;

    @Size(max = 2000)
    private String description;

    private OnboardingTaskStatus status;

    private LocalDate dueDate;

    private UUID assignedUserId;

    @Size(max = 2000)
    private String notes;

    private Integer taskOrder;
}
