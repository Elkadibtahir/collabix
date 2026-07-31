package com.trio.backend.repository;

import com.trio.backend.entity.SecurityAudit;
import com.trio.backend.enums.AuditStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SecurityAuditRepository extends JpaRepository<SecurityAudit, UUID>,
        JpaSpecificationExecutor<SecurityAudit> {

    Optional<SecurityAudit> findByIdAndDepartment_Id(UUID id, UUID departmentId);

    boolean existsByProject_IdAndName(UUID projectId, String name);

    long countByDepartment_Id(UUID departmentId);

    long countByDepartment_IdAndStatus(UUID departmentId, AuditStatus status);

    long countByProject_Id(UUID projectId);

    @Query("SELECT a.status, COUNT(a) FROM SecurityAudit a WHERE a.department.id = :departmentId GROUP BY a.status")
    List<Object[]> countByStatusGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT a.project.id, a.project.name, COUNT(a) FROM SecurityAudit a WHERE a.department.id = :departmentId GROUP BY a.project.id, a.project.name")
    List<Object[]> countByProjectGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT a.team.name, COUNT(a) FROM SecurityAudit a WHERE a.department.id = :departmentId AND a.team IS NOT NULL GROUP BY a.team.name")
    List<Object[]> countByTeamGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT a FROM SecurityAudit a WHERE a.department.id = :departmentId AND a.status = 'COMPLETED' AND a.startDate IS NOT NULL AND a.completedAt IS NOT NULL")
    List<SecurityAudit> findCompletedWithDates(@Param("departmentId") UUID departmentId);

    @Query("SELECT a FROM SecurityAudit a WHERE a.department.id = :departmentId AND a.completionPercentage IS NOT NULL")
    List<SecurityAudit> findWithcompletionPercentage(@Param("departmentId") UUID departmentId);
}
