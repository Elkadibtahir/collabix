package com.trio.backend.dto.hr;

import com.trio.backend.enums.EmploymentStatus;
import com.trio.backend.enums.ContractType;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class EmployeeStatistics {

    private long totalEmployees;
    private long activeEmployees;
    private long onLeaveCount;
    private long probationCount;
    private Map<String, Long> employeesByDepartment;
    private Map<String, Long> employeesByTeam;
    private Map<ContractType, Long> employeesByEmploymentType;
    private Map<EmploymentStatus, Long> employeesByStatus;
    private long newHiresThisMonth;
}
