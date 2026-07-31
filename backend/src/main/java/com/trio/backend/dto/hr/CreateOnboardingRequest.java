package com.trio.backend.dto.hr;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateOnboardingRequest {

    @NotNull
    private UUID employeeId;

    @NotNull
    private LocalDate startDate;

    private LocalDate expectedCompletionDate;

    private UUID assignedHrId;

    private UUID assignedManagerId;

    private String notes;
}
