package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.CreatePerformanceReviewRequest;
import com.trio.backend.dto.hr.PerformanceReviewResponse;
import com.trio.backend.dto.hr.PerformanceReviewSearchCriteria;
import com.trio.backend.dto.hr.PerformanceReviewStatistics;
import com.trio.backend.dto.hr.UpdatePerformanceReviewRequest;
import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.Employee;
import com.trio.backend.entity.EmployeeEventLog;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.PerformanceReview;
import com.trio.backend.entity.Team;
import com.trio.backend.enums.EmploymentStatus;
import com.trio.backend.enums.PerformanceLevel;
import com.trio.backend.enums.ReviewPeriod;
import com.trio.backend.enums.ReviewStatus;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.PerformanceReviewMapper;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.EmployeeEventLogRepository;
import com.trio.backend.repository.EmployeeRepository;
import com.trio.backend.repository.PerformanceReviewRepository;
import com.trio.backend.repository.PerformanceReviewSpecification;
import com.trio.backend.repository.TeamRepository;
import com.trio.backend.service.NotificationService;
import com.trio.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PerformanceReviewServiceImpl implements PerformanceReviewService {

    private static final int MAX_SCORE = 160;
    private static final int CRITERIA_COUNT = 8;

    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final EmployeeEventLogRepository employeeEventLogRepository;
    private final NotificationService notificationService;
    private final PerformanceReviewMapper reviewMapper;

    @Override
    public PerformanceReviewResponse create(UUID workspaceId, UUID departmentId, CreatePerformanceReviewRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Employee employee = findActiveEmployee(workspaceId, departmentId, request.getEmployeeId());
        Employee reviewer = findActiveEmployee(workspaceId, departmentId, request.getReviewerId());

        if (request.getEmployeeId().equals(request.getReviewerId())) {
            throw new BadRequestException("A reviewer cannot review themselves.");
        }

        if (reviewRepository.existsByEmployee_IdAndReviewPeriodAndReviewDateAndStatusNot(
                request.getEmployeeId(), request.getReviewPeriod().name(), request.getReviewDate(), ReviewStatus.ARCHIVED)) {
            throw new ConflictException("A review already exists for this employee in the given period.");
        }

        Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findByIdAndDepartment_Id(request.getTeamId(), departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found."));
        }

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .team(team)
                .reviewPeriod(request.getReviewPeriod())
                .reviewDate(request.getReviewDate())
                .dueDate(request.getDueDate())
                .status(ReviewStatus.DRAFT)
                .objectivesAchieved(request.getObjectivesAchieved())
                .technicalSkills(request.getTechnicalSkills())
                .softSkills(request.getSoftSkills())
                .punctualityAttendance(request.getPunctualityAttendance())
                .teamwork(request.getTeamwork())
                .initiativeProblemSolving(request.getInitiativeProblemSolving())
                .communication(request.getCommunication())
                .continuousLearningAdaptability(request.getContinuousLearningAdaptability())
                .generalComment(request.getGeneralComment())
                .strengths(request.getStrengths())
                .areasForImprovement(request.getAreasForImprovement())
                .developmentPlan(request.getDevelopmentPlan())
                .promotionRecommended(request.getPromotionRecommended())
                .salaryIncreaseRecommended(request.getSalaryIncreaseRecommended())
                .build();

        calculateScores(review);
        PerformanceReview saved = reviewRepository.save(review);

        log.info("Performance review created for employee {} by reviewer {} by user {}",
                employee.getId(), reviewer.getId(), userId);

        createEventLog(employee, "REVIEW_CREATED", null, saved.getId().toString(),
                "Performance review created for " + employee.getFirstName() + " " + employee.getLastName());

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(reviewer.getId());
        notifReq.setNotificationType(Notification.NotificationType.REVIEW_ASSIGNED);
        notifReq.setTitle("Review assigned");
        notifReq.setBody("A performance review for " + employee.getFirstName() + " " + employee.getLastName() + " has been assigned to you.");
        notificationService.create(workspaceId, notifReq);

        return reviewMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PerformanceReviewResponse getById(UUID workspaceId, UUID departmentId, UUID reviewId) {
        SecurityUtils.getCurrentUserId();
        PerformanceReview review = findReview(workspaceId, departmentId, reviewId);
        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PerformanceReviewResponse> search(UUID workspaceId, UUID departmentId,
                                                   PerformanceReviewSearchCriteria criteria, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return reviewRepository.findAll(
                        PerformanceReviewSpecification.withFilter(departmentId, criteria), pageable)
                .map(reviewMapper::toResponse);
    }

    @Override
    public PerformanceReviewResponse update(UUID workspaceId, UUID departmentId, UUID reviewId,
                                             UpdatePerformanceReviewRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        PerformanceReview review = findReview(workspaceId, departmentId, reviewId);

        if (review.getStatus() == ReviewStatus.APPROVED || review.getStatus() == ReviewStatus.ARCHIVED) {
            throw new BadRequestException("Cannot modify an approved or archived review.");
        }

        if (request.getReviewerId() != null) {
            Employee reviewer = findActiveEmployee(workspaceId, departmentId, request.getReviewerId());
            if (review.getEmployee().getId().equals(request.getReviewerId())) {
                throw new BadRequestException("A reviewer cannot review themselves.");
            }
            review.setReviewer(reviewer);
        }
        if (request.getTeamId() != null) {
            Team team = teamRepository.findByIdAndDepartment_Id(request.getTeamId(), departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found."));
            review.setTeam(team);
        }
        if (request.getReviewPeriod() != null) review.setReviewPeriod(request.getReviewPeriod());
        if (request.getReviewDate() != null) review.setReviewDate(request.getReviewDate());
        if (request.getDueDate() != null) review.setDueDate(request.getDueDate());
        if (request.getObjectivesAchieved() != null) review.setObjectivesAchieved(request.getObjectivesAchieved());
        if (request.getTechnicalSkills() != null) review.setTechnicalSkills(request.getTechnicalSkills());
        if (request.getSoftSkills() != null) review.setSoftSkills(request.getSoftSkills());
        if (request.getPunctualityAttendance() != null) review.setPunctualityAttendance(request.getPunctualityAttendance());
        if (request.getTeamwork() != null) review.setTeamwork(request.getTeamwork());
        if (request.getInitiativeProblemSolving() != null) review.setInitiativeProblemSolving(request.getInitiativeProblemSolving());
        if (request.getCommunication() != null) review.setCommunication(request.getCommunication());
        if (request.getContinuousLearningAdaptability() != null) review.setContinuousLearningAdaptability(request.getContinuousLearningAdaptability());
        if (request.getGeneralComment() != null) review.setGeneralComment(request.getGeneralComment());
        if (request.getManagerComment() != null) review.setManagerComment(request.getManagerComment());
        if (request.getStrengths() != null) review.setStrengths(request.getStrengths());
        if (request.getAreasForImprovement() != null) review.setAreasForImprovement(request.getAreasForImprovement());
        if (request.getDevelopmentPlan() != null) review.setDevelopmentPlan(request.getDevelopmentPlan());
        if (request.getPromotionRecommended() != null) review.setPromotionRecommended(request.getPromotionRecommended());
        if (request.getSalaryIncreaseRecommended() != null) review.setSalaryIncreaseRecommended(request.getSalaryIncreaseRecommended());

        calculateScores(review);
        PerformanceReview saved = reviewRepository.save(review);

        log.info("Performance review {} updated by user {}", reviewId, userId);

        return reviewMapper.toResponse(saved);
    }

    @Override
    public PerformanceReviewResponse submit(UUID workspaceId, UUID departmentId, UUID reviewId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        PerformanceReview review = findReview(workspaceId, departmentId, reviewId);

        if (review.getStatus() != ReviewStatus.DRAFT && review.getStatus() != ReviewStatus.REJECTED) {
            throw new BadRequestException("Only draft or rejected reviews can be submitted.");
        }

        if (!allScoresEntered(review)) {
            throw new BadRequestException("All scoring criteria must be Completed before submission.");
        }

        review.setStatus(ReviewStatus.SUBMITTED);
        review.setSubmittedAt(Instant.now());
        PerformanceReview saved = reviewRepository.save(review);

        log.info("Performance review {} submitted by user {}", reviewId, userId);

        createEventLog(review.getEmployee(), "REVIEW_SUBMITTED", null, reviewId.toString(),
                "Performance review submitted for " + review.getEmployee().getFirstName() + " " + review.getEmployee().getLastName());

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(review.getEmployee().getId());
        notifReq.setNotificationType(Notification.NotificationType.REVIEW_SUBMITTED);
        notifReq.setTitle("Review submitted");
        notifReq.setBody("Your performance review has been submitted for approval.");
        notificationService.create(workspaceId, notifReq);

        return reviewMapper.toResponse(saved);
    }

    @Override
    public PerformanceReviewResponse approve(UUID workspaceId, UUID departmentId, UUID reviewId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        PerformanceReview review = findReview(workspaceId, departmentId, reviewId);

        if (review.getStatus() != ReviewStatus.SUBMITTED) {
            throw new BadRequestException("Only submitted reviews can be approved.");
        }

        if (review.getReviewer().getId().equals(userId)) {
            throw new ForbiddenException("A reviewer cannot approve their own review.");
        }

        review.setStatus(ReviewStatus.APPROVED);
        review.setApprovedAt(Instant.now());
        PerformanceReview saved = reviewRepository.save(review);

        log.info("Performance review {} approved by user {}", reviewId, userId);

        createEventLog(review.getEmployee(), "REVIEW_APPROVED", null, reviewId.toString(),
                "Performance review approved for " + review.getEmployee().getFirstName() + " " + review.getEmployee().getLastName());

        String levelMsg = review.getPerformanceLevel() != null
                ? " Performance level: " + review.getPerformanceLevel().name()
                : "";

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(review.getEmployee().getId());
        notifReq.setNotificationType(Notification.NotificationType.REVIEW_APPROVED);
        notifReq.setTitle("Review approved");
        notifReq.setBody("Your performance review has been approved." + levelMsg);
        notificationService.create(workspaceId, notifReq);

        return reviewMapper.toResponse(saved);
    }

    @Override
    public PerformanceReviewResponse reject(UUID workspaceId, UUID departmentId, UUID reviewId, String reason) {
        UUID userId = SecurityUtils.getCurrentUserId();
        PerformanceReview review = findReview(workspaceId, departmentId, reviewId);

        if (review.getStatus() != ReviewStatus.SUBMITTED) {
            throw new BadRequestException("Only submitted reviews can be rejected.");
        }

        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Rejection reason is required.");
        }

        review.setStatus(ReviewStatus.REJECTED);
        review.setRejectedAt(Instant.now());
        review.setRejectionReason(reason);
        PerformanceReview saved = reviewRepository.save(review);

        log.info("Performance review {} rejected by user {}", reviewId, userId);

        createEventLog(review.getEmployee(), "REVIEW_REJECTED", null, reviewId.toString(),
                "Performance review rejected for " + review.getEmployee().getFirstName() + " " + review.getEmployee().getLastName() + ". Reason: " + reason);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(review.getEmployee().getId());
        notifReq.setNotificationType(Notification.NotificationType.REVIEW_REJECTED);
        notifReq.setTitle("Review rejected");
        notifReq.setBody("Your performance review has been rejected. Reason: " + reason);
        notificationService.create(workspaceId, notifReq);

        return reviewMapper.toResponse(saved);
    }

    @Override
    public PerformanceReviewResponse archive(UUID workspaceId, UUID departmentId, UUID reviewId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        PerformanceReview review = findReview(workspaceId, departmentId, reviewId);

        if (review.getStatus() == ReviewStatus.ARCHIVED) {
            throw new BadRequestException("Review is already archived.");
        }

        review.setStatus(ReviewStatus.ARCHIVED);
        PerformanceReview saved = reviewRepository.save(review);

        log.info("Performance review {} archived by user {}", reviewId, userId);

        return reviewMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID workspaceId, UUID departmentId, UUID reviewId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        PerformanceReview review = findReview(workspaceId, departmentId, reviewId);

        if (review.getStatus() != ReviewStatus.DRAFT) {
            throw new BadRequestException("Only draft reviews can be deleted.");
        }

        reviewRepository.delete(review);
        log.info("Performance review {} deleted by user {}", reviewId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public PerformanceReviewStatistics getStatistics(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        PerformanceReviewStatistics stats = new PerformanceReviewStatistics();

        long total = reviewRepository.countByEmployee_Department_Id(departmentId);
        stats.setTotalReviews(total);

        Double deptAvg = reviewRepository.averagePercentageByDepartmentId(departmentId);
        stats.setAverageDepartmentScore(deptAvg != null ? deptAvg : 0);

        Double companyAvg = reviewRepository.averagePercentageAll();
        stats.setAverageCompanyScore(companyAvg != null ? companyAvg : 0);

        Double highest = reviewRepository.maxPercentageByDepartmentId(departmentId);
        stats.setHighestScore(highest != null ? highest : 0);

        Double lowest = reviewRepository.minPercentageByDepartmentId(departmentId);
        stats.setLowestScore(lowest != null ? lowest : 0);

        Map<String, Long> perfDist = new HashMap<>();
        for (Object[] row : reviewRepository.countByPerformanceLevelGrouped(departmentId)) {
            PerformanceLevel level = (PerformanceLevel) row[0];
            perfDist.put(level != null ? level.name() : "UNKNOWN", (Long) row[1]);
        }
        stats.setPerformanceDissortgoalion(perfDist);

        stats.setOutstandingEmployees(
                reviewRepository.countByEmployee_Department_IdAndPerformanceLevel(departmentId, PerformanceLevel.OUTSTANDING));
        stats.setNeedsImprovementEmployees(
                reviewRepository.countByEmployee_Department_IdAndPerformanceLevel(departmentId, PerformanceLevel.NEEDS_IMPROVEMENT));

        Map<String, Double> avgPerCriterion = new HashMap<>();
        List<Object[]> avgScores = reviewRepository.averageScoresByDepartmentId(departmentId);
        if (!avgScores.isEmpty()) {
            Object[] row = avgScores.get(0);
            avgPerCriterion.put("objectivesAchieved", row[0] != null ? (Double) row[0] : 0);
            avgPerCriterion.put("technicalSkills", row[1] != null ? (Double) row[1] : 0);
            avgPerCriterion.put("softSkills", row[2] != null ? (Double) row[2] : 0);
            avgPerCriterion.put("punctualityAttendance", row[3] != null ? (Double) row[3] : 0);
            avgPerCriterion.put("teamwork", row[4] != null ? (Double) row[4] : 0);
            avgPerCriterion.put("initiativeProblemSolving", row[5] != null ? (Double) row[5] : 0);
            avgPerCriterion.put("communication", row[6] != null ? (Double) row[6] : 0);
            avgPerCriterion.put("ContinuousLearningAdaptability", row[7] != null ? (Double) row[7] : 0);
        }
        stats.setAverageScorePerCriterion(avgPerCriterion);

        Map<String, Long> trendByPeriod = new HashMap<>();
        for (Object[] row : reviewRepository.countByReviewPeriodGrouped(departmentId)) {
            ReviewPeriod period = (ReviewPeriod) row[0];
            trendByPeriod.put(period.name(), (Long) row[1]);
        }
        stats.setTrendByReviewPeriod(trendByPeriod);

        return stats;
    }

    private void calculateScores(PerformanceReview review) {
        int total = 0;
        total += scoreOrZero(review.getObjectivesAchieved());
        total += scoreOrZero(review.getTechnicalSkills());
        total += scoreOrZero(review.getSoftSkills());
        total += scoreOrZero(review.getPunctualityAttendance());
        total += scoreOrZero(review.getTeamwork());
        total += scoreOrZero(review.getInitiativeProblemSolving());
        total += scoreOrZero(review.getCommunication());
        total += scoreOrZero(review.getContinuousLearningAdaptability());

        review.setTotalScore(total);
        review.setMaxScore(MAX_SCORE);

        if (total > 0) {
            double pct = (double) total / MAX_SCORE * 100;
            review.setPercentage(Math.round(pct * 100.0) / 100.0);
            review.setAverageScore(Math.round((double) total / CRITERIA_COUNT * 100.0) / 100.0);
            review.setPerformanceLevel(determineLevel(review.getPercentage()));
        } else {
            review.setPercentage(0.0);
            review.setAverageScore(0.0);
            review.setPerformanceLevel(null);
        }
    }

    private PerformanceLevel determineLevel(double percentage) {
        if (percentage >= 95) return PerformanceLevel.OUTSTANDING;
        if (percentage >= 90) return PerformanceLevel.EXCELLENT;
        if (percentage >= 80) return PerformanceLevel.VERY_GOOD;
        if (percentage >= 70) return PerformanceLevel.GOOD;
        if (percentage >= 60) return PerformanceLevel.SATISFACTORY;
        if (percentage >= 50) return PerformanceLevel.NEEDS_IMPROVEMENT;
        return PerformanceLevel.UNSATISFACTORY;
    }

    private boolean allScoresEntered(PerformanceReview review) {
        return review.getObjectivesAchieved() != null
                && review.getTechnicalSkills() != null
                && review.getSoftSkills() != null
                && review.getPunctualityAttendance() != null
                && review.getTeamwork() != null
                && review.getInitiativeProblemSolving() != null
                && review.getCommunication() != null
                && review.getContinuousLearningAdaptability() != null;
    }

    private int scoreOrZero(Integer score) {
        return score != null ? score : 0;
    }

    private PerformanceReview findReview(UUID workspaceId, UUID departmentId, UUID reviewId) {
        findActiveDepartment(workspaceId, departmentId);
        return reviewRepository.findByIdAndEmployee_Department_Id(reviewId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Performance review not found."));
    }

    private Employee findActiveEmployee(UUID workspaceId, UUID departmentId, UUID employeeId) {
        findActiveDepartment(workspaceId, departmentId);
        Employee employee = employeeRepository.findByIdAndDepartment_Id(employeeId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
        if (employee.getEmploymentStatus() == EmploymentStatus.TERMINATED
                || employee.getEmploymentStatus() == EmploymentStatus.RESIGNED
                || employee.getEmploymentStatus() == EmploymentStatus.RETIRED) {
            throw new ResourceNotFoundException("Employee not found.");
        }
        return employee;
    }

    private void findActiveDepartment(UUID workspaceId, UUID departmentId) {
        departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .filter(dept -> dept.getStatus() == WorkspaceStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
    }

    private void createEventLog(Employee employee, String eventType, String previousValue,
                                String newValue, String description) {
        EmployeeEventLog log = EmployeeEventLog.builder()
                .employee(employee)
                .eventType(eventType)
                .previousValue(previousValue)
                .newValue(newValue)
                .description(description)
                .build();
        employeeEventLogRepository.save(log);
    }
}
