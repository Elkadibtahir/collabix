package com.trio.backend.dto.hr;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class PerformanceReviewStatistics {

    private long totalReviews;
    private double averageCompanyScore;
    private double averageDepartmentScore;
    private double averageTeamScore;
    private double highestScore;
    private double lowestScore;
    private Map<String, Long> performanceDissortgoalion;
    private long outstandingEmployees;
    private long needsImprovementEmployees;
    private Map<String, Double> averageScorePerCriterion;
    private Map<String, Long> trendByReviewPeriod;
}
