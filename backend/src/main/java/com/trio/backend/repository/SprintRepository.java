package com.trio.backend.repository;

import com.trio.backend.entity.Sprint;
import com.trio.backend.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SprintRepository extends JpaRepository<Sprint, UUID>,
        JpaSpecificationExecutor<Sprint> {

    Optional<Sprint> findByIdAndDepartment_Id(UUID id, UUID departmentId);

    boolean existsByProject_IdAndName(UUID projectId, String name);

    long countByDepartment_Id(UUID departmentId);

    long countByDepartment_IdAndStatus(UUID departmentId, SprintStatus status);

    long countByProject_Id(UUID projectId);

    @Query("SELECT s.status, COUNT(s) FROM Sprint s WHERE s.department.id = :departmentId GROUP BY s.status")
    List<Object[]> countByStatusGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT s.project.id, s.project.name, COUNT(s) FROM Sprint s WHERE s.department.id = :departmentId GROUP BY s.project.id, s.project.name")
    List<Object[]> countByProjectGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT s FROM Sprint s WHERE s.department.id = :departmentId AND s.status = 'COMPLETED' AND s.startDate IS NOT NULL AND s.endDate IS NOT NULL")
    List<Sprint> findCompletedWithDates(@Param("departmentId") UUID departmentId);

    @Query("SELECT s FROM Sprint s WHERE s.department.id = :departmentId AND s.status = 'COMPLETED' AND s.completionPercentage IS NOT NULL")
    List<Sprint> findCompletedWithPercentage(@Param("departmentId") UUID departmentId);

    @Query("SELECT s FROM Sprint s WHERE s.department.id = :departmentId AND s.status = 'COMPLETED' AND s.velocity IS NOT NULL")
    List<Sprint> findCompletedWithVelocity(@Param("departmentId") UUID departmentId);

    @Query("SELECT s FROM Sprint s WHERE s.department.id = :departmentId AND s.totalTasks IS NOT NULL")
    List<Sprint> findWithTaskCount(@Param("departmentId") UUID departmentId);
}
