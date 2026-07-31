package com.trio.backend.dto.hr;

import com.trio.backend.enums.EmploymentStatus;
import com.trio.backend.enums.ContractType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class EmployeeSearchCriteria {

    private String keyword;
    private String employeeNumber;
    private UUID departmentId;
    private UUID teamId;
    private UUID managerId;
    private String position;
    private EmploymentStatus status;
    private ContractType employmentType;
    private LocalDate startDateFrom;
    private LocalDate startDateTo;
}
