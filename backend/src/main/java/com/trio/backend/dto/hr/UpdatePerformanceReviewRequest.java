package com.trio.backend.dto.hr;

import com.trio.backend.enums.ReviewPeriod;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class UpdatePerformanceReviewRequest {

    private UUID reviewerId;
    private UUID teamId;
    private ReviewPeriod reviewPeriod;
    private LocalDate reviewDate;
    private LocalDate dueDate;
    private Integer objectivesAchieved;
    private Integer technicalSkills;
    private Integer softSkills;
    private Integer punctualityAttendance;
    private Integer teamwork;
    private Integer initiativeProblemSolving;
    private Integer communication;
    private Integer ContinuousLearningAdaptability;
    private String generalComment;
    private String managerComment;
    private String employeeComment;
    private String strengths;
    private String areasForImprovement;
    private String developmentPlan;
    private Boolean promotionRecommended;
    private Boolean salaryIncreaseRecommended;
}
