package com.trio.backend.dto.hr;

import com.trio.backend.enums.OnboardingStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class UpdateOnboardingRequest {

    private OnboardingStatus status;
    private LocalDate startDate;
    private LocalDate expectedCompletionDate;
    private LocalDate actualCompletionDate;
    private UUID assignedHrId;
    private UUID assignedManagerId;
    private String notes;
}
