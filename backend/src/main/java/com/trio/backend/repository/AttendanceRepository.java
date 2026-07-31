package com.trio.backend.repository;

import com.trio.backend.entity.Attendance;
import com.trio.backend.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID>,
        JpaSpecificationExecutor<Attendance> {

    Optional<Attendance> findByEmployee_IdAndDate(UUID employeeId, LocalDate date);

    Optional<Attendance> findByIdAndEmployee_Id(UUID id, UUID employeeId);

    Optional<Attendance> findByIdAndEmployee_Department_Id(UUID id, UUID departmentId);

    List<Attendance> findAllByEmployee_IdAndDateBetweenOrderByDateAsc(UUID employeeId, LocalDate start, LocalDate end);

    boolean existsByEmployee_IdAndDate(UUID employeeId, LocalDate date);

    long countByEmployee_Department_Id(UUID departmentId);

    long countByEmployee_Department_IdAndStatus(UUID departmentId, AttendanceStatus status);

    long countByEmployee_IdAndDateBetween(UUID employeeId, LocalDate start, LocalDate end);

    @Query("SELECT a.status, COUNT(a) FROM Attendance a WHERE a.employee.department.id = :departmentId GROUP BY a.status")
    List<Object[]> countByStatusGrouped(@Param("departmentId") UUID departmentId);

    @Query("SELECT AVG(a.workedHours) FROM Attendance a WHERE a.employee.department.id = :departmentId AND a.workedHours IS NOT NULL")
    Double averageWorkedHoursByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT COALESCE(SUM(a.overtimeHours), 0) FROM Attendance a WHERE a.employee.department.id = :departmentId AND a.overtimeHours IS NOT NULL")
    double totalOvertimeByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT AVG(a.workedHours) FROM Attendance a WHERE a.employee.id = :employeeId AND a.workedHours IS NOT NULL")
    Double averageWorkedHoursByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT COALESCE(SUM(a.overtimeHours), 0) FROM Attendance a WHERE a.employee.id = :employeeId AND a.overtimeHours IS NOT NULL")
    double totalOvertimeByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT a FROM Attendance a WHERE a.employee.department.id = :departmentId AND a.checkOutTime IS NULL AND a.date < :today")
    List<Attendance> findMissingCheckOutByDepartmentId(@Param("departmentId") UUID departmentId, @Param("today") LocalDate today);
}
