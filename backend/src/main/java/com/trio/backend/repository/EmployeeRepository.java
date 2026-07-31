package com.trio.backend.repository;

import com.trio.backend.entity.Employee;
import com.trio.backend.enums.EmploymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID>, JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByIdAndDepartment_Id(UUID id, UUID departmentId);

    Page<Employee> findAllByDepartment_Id(UUID departmentId, Pageable pageable);

    boolean existsByEmployeeNumber(String employeeNumber);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);

    long countByDepartment_Id(UUID departmentId);

    long countByDepartment_IdAndEmploymentStatus(UUID departmentId, EmploymentStatus status);

    long countByEmploymentStatus(EmploymentStatus status);

    long countByTeam_Id(UUID teamId);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.department.id = :departmentId AND e.employmentStatus = 'ACTIVE'")
    long countActiveByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT e.department.name, COUNT(e) FROM Employee e WHERE e.department.id = :departmentId GROUP BY e.department.name")
    List<Object[]> countByDepartmentGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT e.team.name, COUNT(e) FROM Employee e WHERE e.department.id = :departmentId AND e.team IS NOT NULL GROUP BY e.team.name")
    List<Object[]> countByTeamGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT e.employmentType, COUNT(e) FROM Employee e WHERE e.department.id = :departmentId GROUP BY e.employmentType")
    List<Object[]> countByEmploymentTypeGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT e.employmentStatus, COUNT(e) FROM Employee e WHERE e.department.id = :departmentId GROUP BY e.employmentStatus")
    List<Object[]> countByEmploymentStatusGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.department.id = :departmentId AND e.startDate >= CURRENT_DATE - 30 day")
    long countNewHiresThisMonth(@Param("departmentId") UUID departmentId);
}
