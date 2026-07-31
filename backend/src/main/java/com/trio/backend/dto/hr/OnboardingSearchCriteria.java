package com.trio.backend.dto.hr;

import com.trio.backend.enums.OnboardingStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class OnboardingSearchCriteria {

    private UUID employeeId;
    private UUID departmentId;
    private UUID teamId;
    private UUID managerId;
    private OnboardingStatus status;
    private UUID assignedHrId;
    private LocalDate startDateFrom;
    private LocalDate startDateTo;
    private Integer completionPercentageMin;
    private String keyword;
}
