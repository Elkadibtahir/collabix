package com.trio.backend.dto.hr;

import com.trio.backend.enums.PerformanceLevel;
import com.trio.backend.enums.ReviewPeriod;
import com.trio.backend.enums.ReviewStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class PerformanceReviewSearchCriteria {

    private UUID employeeId;
    private UUID departmentId;
    private UUID teamId;
    private UUID reviewerId;
    private ReviewStatus status;
    private ReviewPeriod reviewPeriod;
    private PerformanceLevel performanceLevel;
    private Double scoreFrom;
    private Double scoreTo;
    private LocalDate dateFrom;
    private LocalDate dateTo;
}
