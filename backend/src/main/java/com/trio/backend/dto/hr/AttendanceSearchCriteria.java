package com.trio.backend.dto.hr;

import com.trio.backend.enums.AttendanceStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class AttendanceSearchCriteria {

    private UUID employeeId;
    private UUID teamId;
    private AttendanceStatus status;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private Integer month;
    private Integer year;
    private UUID createdBy;
    private String keyword;
}
