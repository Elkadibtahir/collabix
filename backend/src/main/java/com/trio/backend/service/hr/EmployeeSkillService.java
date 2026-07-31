package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.CreateEmployeeSkillRequest;
import com.trio.backend.dto.hr.EmployeeSkillResponse;
import com.trio.backend.dto.hr.EmployeeSkillSearchCriteria;
import com.trio.backend.dto.hr.EmployeeSkillStatistics;
import com.trio.backend.dto.hr.UpdateEmployeeSkillRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface EmployeeSkillService {

    EmployeeSkillResponse create(UUID workspaceId, UUID departmentId, UUID employeeId, CreateEmployeeSkillRequest request);

    EmployeeSkillResponse getById(UUID workspaceId, UUID departmentId, UUID employeeId, UUID skillId);

    Page<EmployeeSkillResponse> listByEmployee(UUID workspaceId, UUID departmentId, UUID employeeId, Pageable pageable);

    Page<EmployeeSkillResponse> search(UUID workspaceId, UUID departmentId, EmployeeSkillSearchCriteria criteria, Pageable pageable);

    EmployeeSkillResponse update(UUID workspaceId, UUID departmentId, UUID employeeId, UUID skillId, UpdateEmployeeSkillRequest request);

    void delete(UUID workspaceId, UUID departmentId, UUID employeeId, UUID skillId);

    EmployeeSkillResponse verify(UUID workspaceId, UUID departmentId, UUID employeeId, UUID skillId);

    EmployeeSkillResponse unverify(UUID workspaceId, UUID departmentId, UUID employeeId, UUID skillId);

    EmployeeSkillStatistics getStatistics(UUID workspaceId, UUID departmentId);

    List<EmployeeSkillResponse> getExpiringCertifications(UUID workspaceId, UUID departmentId, int withinDays);
}
