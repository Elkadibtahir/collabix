package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.PerformanceLevel;
import com.trio.backend.enums.ReviewPeriod;
import com.trio.backend.enums.ReviewStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
        name = "hr_performance_reviews",
        indexes = {
                @Index(name = "idx_hr_pr_employee_id", columnList = "employee_id"),
                @Index(name = "idx_hr_pr_reviewer_id", columnList = "reviewer_id"),
                @Index(name = "idx_hr_pr_team_id", columnList = "team_id"),
                @Index(name = "idx_hr_pr_status", columnList = "status"),
                @Index(name = "idx_hr_pr_period", columnList = "review_period"),
                @Index(name = "idx_hr_pr_performance_level", columnList = "performance_level"),
                @Index(name = "idx_hr_pr_review_date", columnList = "review_date"),
                @Index(name = "idx_hr_pr_employee_status", columnList = "employee_id, status"),
                @Index(name = "idx_hr_pr_employee_date", columnList = "employee_id, review_date DESC")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReview extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "review_period", nullable = false, length = 20)
    private ReviewPeriod reviewPeriod;

    @NotNull
    @Column(name = "review_date", nullable = false)
    private LocalDate reviewDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReviewStatus status;

    @Min(0) @Max(20)
    @Column(name = "objectives_achieved")
    private Integer objectivesAchieved;

    @Min(0) @Max(20)
    @Column(name = "technical_skills")
    private Integer technicalSkills;

    @Min(0) @Max(20)
    @Column(name = "soft_skills")
    private Integer softSkills;

    @Min(0) @Max(20)
    @Column(name = "punctuality_attendance")
    private Integer punctualityAttendance;

    @Min(0) @Max(20)
    @Column(name = "teamwork")
    private Integer teamwork;

    @Min(0) @Max(20)
    @Column(name = "initiative_problem_solving")
    private Integer initiativeProblemSolving;

    @Min(0) @Max(20)
    @Column(name = "communication")
    private Integer communication;

    @Min(0) @Max(20)
    @Column(name = "continuous_learning_adaptability")
    private Integer continuousLearningAdaptability;

    @Column(name = "total_score")
    private Integer totalScore;

    @Column(name = "max_score")
    private Integer maxScore;

    @Column(name = "percentage")
    private Double percentage;

    @Column(name = "average_score")
    private Double averageScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "performance_level", length = 25)
    private PerformanceLevel performanceLevel;

    @Size(max = 2000)
    @Column(name = "general_comment", length = 2000)
    private String generalComment;

    @Size(max = 2000)
    @Column(name = "manager_comment", length = 2000)
    private String managerComment;

    @Size(max = 2000)
    @Column(name = "employee_comment", length = 2000)
    private String employeeComment;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "areas_for_improvement", columnDefinition = "TEXT")
    private String areasForImprovement;

    @Column(name = "development_plan", columnDefinition = "TEXT")
    private String developmentPlan;

    @Column(name = "promotion_recommended")
    private Boolean promotionRecommended;

    @Column(name = "salary_increase_recommended")
    private Boolean salaryIncreaseRecommended;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Size(max = 1000)
    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = ReviewStatus.DRAFT;
        }
    }
}
