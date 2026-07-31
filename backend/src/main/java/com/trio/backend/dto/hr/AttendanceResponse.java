package com.trio.backend.dto.hr;

import com.trio.backend.enums.AttendanceStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class AttendanceResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeNumber;
    private LocalDate date;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Double workedHours;
    private Integer breakDuration;
    private Double overtimeHours;
    private AttendanceStatus status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
