package com.trio.backend.repository;

import com.trio.backend.entity.Onboarding;
import com.trio.backend.enums.OnboardingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OnboardingRepository extends JpaRepository<Onboarding, UUID>,
        JpaSpecificationExecutor<Onboarding> {

    Optional<Onboarding> findByEmployee_Id(UUID employeeId);

    Optional<Onboarding> findByIdAndEmployee_Department_Id(UUID id, UUID departmentId);

    boolean existsByEmployee_IdAndStatusNot(UUID employeeId, OnboardingStatus status);

    long countByEmployee_Department_Id(UUID departmentId);

    long countByEmployee_Department_IdAndStatus(UUID departmentId, OnboardingStatus status);

    @Query("SELECT COUNT(o) FROM Onboarding o WHERE o.employee.department.id = :departmentId AND o.startDate >= :firstDay AND o.startDate < :firstDayNextMonth")
    long countOnboardingThisMonth(@Param("departmentId") UUID departmentId, @Param("firstDay") LocalDate firstDay, @Param("firstDayNextMonth") LocalDate firstDayNextMonth);

    @Query("SELECT COUNT(o) FROM Onboarding o WHERE o.employee.department.id = :departmentId AND o.status = 'COMPLETED' AND o.actualCompletionDate IS NOT NULL AND o.startDate IS NOT NULL")
    long countCompletedWithDates(@Param("departmentId") UUID departmentId);

    @Query("SELECT o.actualCompletionDate, o.startDate FROM Onboarding o WHERE o.employee.department.id = :departmentId AND o.status = 'COMPLETED' AND o.actualCompletionDate IS NOT NULL AND o.startDate IS NOT NULL")
    List<Object[]> findCompletionDatePairs(@Param("departmentId") UUID departmentId);

    @Query("SELECT COUNT(t) FROM OnboardingTask t JOIN t.onboarding o WHERE o.employee.department.id = :departmentId AND t.status = 'PENDING' AND t.dueDate IS NOT NULL AND t.dueDate < :today")
    long countOverdueTasks(@Param("departmentId") UUID departmentId, @Param("today") LocalDate today);

    @Query("SELECT o.status, COUNT(o) FROM Onboarding o WHERE o.employee.department.id = :departmentId GROUP BY o.status")
    List<Object[]> countByStatusGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT o.employee.department.name, COUNT(o) FROM Onboarding o WHERE o.employee.department.workspace.id = :workspaceId GROUP BY o.employee.department.name ORDER BY COUNT(o) DESC")
    List<Object[]> countByDepartmentAcrossWorkspace(@Param("workspaceId") UUID workspaceId);

    @Query("SELECT COUNT(t), SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) FROM OnboardingTask t JOIN t.onboarding o WHERE o.employee.department.id = :departmentId GROUP BY t.onboarding.id")
    List<Object[]> findTaskCompletionGroupsByDepartmentId(@Param("departmentId") UUID departmentId);
}
