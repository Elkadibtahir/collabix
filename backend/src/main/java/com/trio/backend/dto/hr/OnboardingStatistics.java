package com.trio.backend.dto.hr;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class OnboardingStatistics {

    private long totalOnboardings;
    private long activeOnboardings;
    private long CompletedOnboardings;
    private long cancelledOnboardings;
    private long onHoldCount;
    private long notStartedCount;
    private long onboardingThisMonth;
    private long overdueTasks;
    private double averageCompletionDays;
    private double CompletionRate;
    private double averageCompletionPercentage;
    private Map<String, Long> onboardingsByDepartment;
    private Map<String, Long> onboardingsByStatus;
}
