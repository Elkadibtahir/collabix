package com.trio.backend.repository;

import com.trio.backend.entity.EmployeeEventLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmployeeEventLogRepository extends JpaRepository<EmployeeEventLog, UUID> {

    List<EmployeeEventLog> findAllByEmployee_IdOrderByCreatedAtDesc(UUID employeeId);
}
