package com.trio.backend.dto.hr;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class AttendanceStatistics {

    private long totalRecords;
    private long presentDays;
    private long absentDays;
    private long lateArrivals;
    private long remoteWorkDays;
    private long vacationDays;
    private long sickLeaveDays;
    private double averageWorkedHours;
    private double totalOvertimeHours;
    private double attendanceRate;
    private Map<AttendanceStatus, Long> attendanceByStatus;

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE, HALF_DAY, REMOTE, VACATION, SICK_LEAVE, BUSINESS_TRIP, HOLIDAY
    }
}
