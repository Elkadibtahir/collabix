package com.trio.backend.dto.hr;

import com.trio.backend.enums.ReviewPeriod;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreatePerformanceReviewRequest {

    @NotNull
    private UUID employeeId;

    @NotNull
    private UUID reviewerId;

    private UUID teamId;

    @NotNull
    private ReviewPeriod reviewPeriod;

    @NotNull
    private LocalDate reviewDate;

    private LocalDate dueDate;

    @Min(0) @Max(20)
    private Integer objectivesAchieved;

    @Min(0) @Max(20)
    private Integer technicalSkills;

    @Min(0) @Max(20)
    private Integer softSkills;

    @Min(0) @Max(20)
    private Integer punctualityAttendance;

    @Min(0) @Max(20)
    private Integer teamwork;

    @Min(0) @Max(20)
    private Integer initiativeProblemSolving;

    @Min(0) @Max(20)
    private Integer communication;

    @Min(0) @Max(20)
    private Integer ContinuousLearningAdaptability;

    private String generalComment;

    private String strengths;

    private String areasForImprovement;

    private String developmentPlan;

    private Boolean promotionRecommended;

    private Boolean salaryIncreaseRecommended;
}
