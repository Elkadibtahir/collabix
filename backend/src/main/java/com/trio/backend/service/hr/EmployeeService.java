package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.CreateEmployeeRequest;
import com.trio.backend.dto.hr.EmployeeResponse;
import com.trio.backend.dto.hr.EmployeeSearchCriteria;
import com.trio.backend.dto.hr.EmployeeStatistics;
import com.trio.backend.dto.hr.EmployeeTimelineEntry;
import com.trio.backend.dto.hr.UpdateEmployeeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface EmployeeService {

    EmployeeResponse create(UUID workspaceId, UUID departmentId, CreateEmployeeRequest request);

    EmployeeResponse getById(UUID workspaceId, UUID departmentId, UUID employeeId);

    Page<EmployeeResponse> list(UUID workspaceId, UUID departmentId, EmployeeSearchCriteria criteria, Pageable pageable);

    EmployeeResponse update(UUID workspaceId, UUID departmentId, UUID employeeId, UpdateEmployeeRequest request);

    void delete(UUID workspaceId, UUID departmentId, UUID employeeId);

    List<EmployeeTimelineEntry> getTimeline(UUID workspaceId, UUID departmentId, UUID employeeId);

    EmployeeStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
