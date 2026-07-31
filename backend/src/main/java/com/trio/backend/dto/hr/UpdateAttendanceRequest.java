package com.trio.backend.dto.hr;

import com.trio.backend.enums.AttendanceStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateAttendanceRequest {

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private Integer breakDuration;

    private AttendanceStatus status;

    private String notes;
}
