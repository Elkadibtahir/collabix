package com.trio.backend.repository;

import com.trio.backend.entity.EmployeeDocument;
import com.trio.backend.enums.EmployeeDocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, UUID>,
        JpaSpecificationExecutor<EmployeeDocument> {

    Page<EmployeeDocument> findAllByEmployee_IdAndStatusOrderByCreatedAtDesc(UUID employeeId, com.trio.backend.enums.DocumentStatus status, Pageable pageable);

    Optional<EmployeeDocument> findByIdAndEmployee_IdAndStatus(UUID id, UUID employeeId, com.trio.backend.enums.DocumentStatus status);

    List<EmployeeDocument> findAllByEmployee_IdAndDocumentTypeAndStatus(UUID employeeId, EmployeeDocumentType documentType, com.trio.backend.enums.DocumentStatus status);

    long countByEmployee_IdAndStatus(UUID employeeId, com.trio.backend.enums.DocumentStatus status);

    long countByEmployee_IdAndStatusAndVerified(UUID employeeId, com.trio.backend.enums.DocumentStatus status, boolean verified);

    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM EmployeeDocument d WHERE d.employee.department.id = :departmentId AND d.status = 'ACTIVE'")
    long totalStorageByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT d.documentType, COUNT(d) FROM EmployeeDocument d WHERE d.employee.department.id = :departmentId AND d.status = 'ACTIVE' GROUP BY d.documentType")
    List<Object[]> countByTypeGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT COUNT(d) FROM EmployeeDocument d WHERE d.employee.department.id = :departmentId AND d.status = 'ACTIVE' AND d.expirationDate IS NOT NULL AND d.expirationDate <= :date")
    long countExpiredByDepartmentId(@Param("departmentId") UUID departmentId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(d) FROM EmployeeDocument d WHERE d.employee.department.id = :departmentId AND d.status = 'ACTIVE' AND d.expirationDate IS NOT NULL AND d.expirationDate > :date AND d.expirationDate <= :warningDate")
    long countExpiringByDepartmentId(@Param("departmentId") UUID departmentId, @Param("date") LocalDate date, @Param("warningDate") LocalDate warningDate);

    @Query("SELECT d FROM EmployeeDocument d WHERE d.employee.department.id = :departmentId AND d.status = 'ACTIVE' AND d.expirationDate IS NOT NULL AND d.expirationDate > :date AND d.expirationDate <= :warningDate")
    List<EmployeeDocument> findExpiringByDepartmentId(@Param("departmentId") UUID departmentId, @Param("date") LocalDate date, @Param("warningDate") LocalDate warningDate);

    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM EmployeeDocument d WHERE d.employee.id = :employeeId AND d.status = 'ACTIVE'")
    long totalStorageByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT d.documentType, COUNT(d) FROM EmployeeDocument d WHERE d.employee.id = :employeeId AND d.status = 'ACTIVE' GROUP BY d.documentType")
    List<Object[]> countByTypeGroupedByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(d) FROM EmployeeDocument d WHERE d.employee.id = :employeeId AND d.status = 'ACTIVE' AND d.expirationDate IS NOT NULL AND d.expirationDate <= :date")
    long countExpiredByEmployeeId(@Param("employeeId") UUID employeeId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(d) FROM EmployeeDocument d WHERE d.employee.id = :employeeId AND d.status = 'ACTIVE' AND d.expirationDate IS NOT NULL AND d.expirationDate > :date AND d.expirationDate <= :warningDate")
    long countExpiringByEmployeeId(@Param("employeeId") UUID employeeId, @Param("date") LocalDate date, @Param("warningDate") LocalDate warningDate);
}
