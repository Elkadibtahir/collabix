package com.trio.backend.repository;

import com.trio.backend.entity.PerformanceReview;
import com.trio.backend.enums.PerformanceLevel;
import com.trio.backend.enums.ReviewPeriod;
import com.trio.backend.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, UUID>,
        JpaSpecificationExecutor<PerformanceReview> {

    Optional<PerformanceReview> findByIdAndEmployee_Department_Id(UUID id, UUID departmentId);

    List<PerformanceReview> findAllByEmployee_IdOrderByReviewDateDesc(UUID employeeId);

    boolean existsByEmployee_IdAndReviewPeriodAndReviewDateAndStatusNot(
            UUID employeeId, ReviewPeriod reviewPeriod, java.time.LocalDate reviewDate, ReviewStatus status);

    long countByEmployee_Department_Id(UUID departmentId);

    long countByEmployee_Department_IdAndStatus(UUID departmentId, ReviewStatus status);

    long countByEmployee_Department_IdAndPerformanceLevel(UUID departmentId, PerformanceLevel level);

    long countByEmployee_Department_IdAndPercentageBetween(UUID departmentId, Double from, Double to);

    @Query("SELECT AVG(pr.percentage) FROM PerformanceReview pr WHERE pr.employee.department.id = :departmentId AND pr.percentage IS NOT NULL")
    Double averagePercentageByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT MAX(pr.percentage) FROM PerformanceReview pr WHERE pr.employee.department.id = :departmentId AND pr.percentage IS NOT NULL")
    Double maxPercentageByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT MIN(pr.percentage) FROM PerformanceReview pr WHERE pr.employee.department.id = :departmentId AND pr.percentage IS NOT NULL")
    Double minPercentageByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT pr.performanceLevel, COUNT(pr) FROM PerformanceReview pr WHERE pr.employee.department.id = :departmentId GROUP BY pr.performanceLevel")
    List<Object[]> countByPerformanceLevelGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT AVG(pr.objectivesAchieved), AVG(pr.technicalSkills), AVG(pr.softSkills), AVG(pr.punctualityAttendance), AVG(pr.teamwork), AVG(pr.initiativeProblemSolving), AVG(pr.communication), AVG(pr.continuousLearningAdaptability) FROM PerformanceReview pr WHERE pr.employee.department.id = :departmentId")
    List<Object[]> averageScoresByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT pr.reviewPeriod, COUNT(pr) FROM PerformanceReview pr WHERE pr.employee.department.id = :departmentId GROUP BY pr.reviewPeriod")
    List<Object[]> countByReviewPeriodGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT AVG(pr.percentage) FROM PerformanceReview pr WHERE pr.team.id = :teamId AND pr.percentage IS NOT NULL")
    Double averagePercentageByTeamId(@Param("teamId") UUID teamId);

    @Query("SELECT AVG(pr.percentage) FROM PerformanceReview pr WHERE pr.percentage IS NOT NULL")
    Double averagePercentageAll();

    @Query("SELECT MAX(pr.percentage) FROM PerformanceReview pr WHERE pr.percentage IS NOT NULL")
    Double maxPercentageAll();

    @Query("SELECT MIN(pr.percentage) FROM PerformanceReview pr WHERE pr.percentage IS NOT NULL")
    Double minPercentageAll();
}
