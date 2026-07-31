package com.trio.backend.dto.hr;

import com.trio.backend.enums.PerformanceLevel;
import com.trio.backend.enums.ReviewPeriod;
import com.trio.backend.enums.ReviewStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class PerformanceReviewResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeNumber;
    private UUID reviewerId;
    private String reviewerName;
    private UUID teamId;
    private String teamName;
    private ReviewPeriod reviewPeriod;
    private LocalDate reviewDate;
    private LocalDate dueDate;
    private ReviewStatus status;
    private Integer objectivesAchieved;
    private Integer technicalSkills;
    private Integer softSkills;
    private Integer punctualityAttendance;
    private Integer teamwork;
    private Integer initiativeProblemSolving;
    private Integer communication;
    private Integer ContinuousLearningAdaptability;
    private Integer totalScore;
    private Integer maxScore;
    private Double percentage;
    private Double averageScore;
    private PerformanceLevel performanceLevel;
    private String generalComment;
    private String managerComment;
    private String employeeComment;
    private String strengths;
    private String areasForImprovement;
    private String developmentPlan;
    private Boolean promotionRecommended;
    private Boolean salaryIncreaseRecommended;
    private Instant submittedAt;
    private Instant approvedAt;
    private Instant rejectedAt;
    private String rejectionReason;
    private Instant createdAt;
    private Instant updatedAt;
}
