package com.trio.backend.dto.hr;

import com.trio.backend.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class CreateAttendanceRequest {

    @NotNull
    private LocalDate date;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private Integer breakDuration;

    @NotNull
    private AttendanceStatus status;

    private String notes;
}
