package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.AttendanceResponse;
import com.trio.backend.dto.hr.AttendanceSearchCriteria;
import com.trio.backend.dto.hr.AttendanceStatistics;
import com.trio.backend.dto.hr.CheckInRequest;
import com.trio.backend.dto.hr.CheckOutRequest;
import com.trio.backend.dto.hr.CreateAttendanceRequest;
import com.trio.backend.dto.hr.UpdateAttendanceRequest;
import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.Attendance;
import com.trio.backend.entity.Employee;
import com.trio.backend.entity.EmployeeEventLog;
import com.trio.backend.entity.Notification;
import com.trio.backend.enums.AttendanceStatus;
import com.trio.backend.enums.EmploymentStatus;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.AttendanceMapper;
import com.trio.backend.repository.AttendanceRepository;
import com.trio.backend.repository.AttendanceSpecification;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.EmployeeEventLogRepository;
import com.trio.backend.repository.EmployeeRepository;
import com.trio.backend.service.NotificationService;
import com.trio.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private static final double STANDARD_WORKING_HOURS = 8.0;
    private static final LocalTime LATE_THRESHOLD = LocalTime.of(9, 0);

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeEventLogRepository employeeEventLogRepository;
    private final NotificationService notificationService;
    private final AttendanceMapper attendanceMapper;

    @Override
    public AttendanceResponse checkIn(UUID workspaceId, UUID departmentId, UUID employeeId, CheckInRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Employee employee = findActiveEmployee(workspaceId, departmentId, employeeId);

        if (attendanceRepository.existsByEmployee_IdAndDate(employeeId, request.getDate())) {
            throw new ConflictException("Attendance record already exists for this date.");
        }

        LocalDateTime now = LocalDateTime.now();
        AttendanceStatus status = now.toLocalTime().isAfter(LATE_THRESHOLD)
                ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(request.getDate())
                .checkInTime(now)
                .breakDuration(0)
                .status(status)
                .notes(request.getNotes())
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Employee {} checked in at {} for date {} by user {}",
                employeeId, now, request.getDate(), userId);

        createEventLog(employee, "ATTENDANCE_CHECK_IN", null, now.toString(),
                employee.getFirstName() + " " + employee.getLastName() + " checked in at " + now.toLocalTime());

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.ATTENDANCE_CHECK_IN);
        notifReq.setTitle("Check-in recorded");
        notifReq.setBody(employee.getFirstName() + " " + employee.getLastName() + " checked in at " + now.toLocalTime());
        notificationService.create(workspaceId, notifReq);

        return attendanceMapper.toResponse(saved);
    }

    @Override
    public AttendanceResponse checkOut(UUID workspaceId, UUID departmentId, UUID employeeId, CheckOutRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Employee employee = findActiveEmployee(workspaceId, departmentId, employeeId);

        Attendance attendance = attendanceRepository.findByEmployee_IdAndDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new BadRequestException("No check-in record found for today."));

        if (attendance.getCheckOutTime() != null) {
            throw new BadRequestException("Already checked out for today.");
        }

        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckOutTime(now);
        if (request.getNotes() != null) {
            attendance.setNotes(request.getNotes());
        }

        calculateWorkedHours(attendance);
        calculateOvertime(attendance);

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Employee {} checked out at {} for date {} by user {}",
                employeeId, now, LocalDate.now(), userId);

        createEventLog(employee, "ATTENDANCE_CHECK_OUT", null, now.toString(),
                employee.getFirstName() + " " + employee.getLastName() + " checked out at " + now.toLocalTime());

        return attendanceMapper.toResponse(saved);
    }

    @Override
    public AttendanceResponse create(UUID workspaceId, UUID departmentId, UUID employeeId, CreateAttendanceRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Employee employee = findActiveEmployee(workspaceId, departmentId, employeeId);

        if (request.getCheckOutTime() != null && request.getCheckInTime() != null
                && request.getCheckOutTime().isBefore(request.getCheckInTime())) {
            throw new BadRequestException("Check-out time cannot be before check-in time.");
        }

        if (attendanceRepository.existsByEmployee_IdAndDate(employeeId, request.getDate())) {
            throw new ConflictException("Attendance record already exists for this date.");
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(request.getDate())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .breakDuration(request.getBreakDuration() != null ? request.getBreakDuration() : 0)
                .status(request.getStatus())
                .notes(request.getNotes())
                .build();

        calculateWorkedHours(attendance);
        calculateOvertime(attendance);

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Attendance record created for employee {} for date {} by user {}",
                employeeId, request.getDate(), userId);

        return attendanceMapper.toResponse(saved);
    }

    @Override
    public AttendanceResponse update(UUID workspaceId, UUID departmentId, UUID attendanceId, UpdateAttendanceRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Attendance attendance = findAttendance(workspaceId, departmentId, attendanceId);

        if (request.getCheckInTime() != null) {
            attendance.setCheckInTime(request.getCheckInTime());
        }
        if (request.getCheckOutTime() != null) {
            attendance.setCheckOutTime(request.getCheckOutTime());
        }
        if (request.getBreakDuration() != null) {
            attendance.setBreakDuration(request.getBreakDuration());
        }
        if (request.getStatus() != null) {
            attendance.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            attendance.setNotes(request.getNotes());
        }

        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null
                && attendance.getCheckOutTime().isBefore(attendance.getCheckInTime())) {
            throw new BadRequestException("Check-out time cannot be before check-in time.");
        }

        calculateWorkedHours(attendance);
        calculateOvertime(attendance);

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Attendance record {} updated by user {}", attendanceId, userId);

        createEventLog(saved.getEmployee(), "ATTENDANCE_CORRECTED", null, attendanceId.toString(),
                "Attendance correctd for " + saved.getEmployee().getFirstName() + " " + saved.getEmployee().getLastName());

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(saved.getEmployee().getId());
        notifReq.setNotificationType(Notification.NotificationType.ATTENDANCE_CORRECTED);
        notifReq.setTitle("Attendance correctd");
        notifReq.setBody("Attendance record for " + saved.getDate() + " has been correctd.");
        notificationService.create(workspaceId, notifReq);

        return attendanceMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getById(UUID workspaceId, UUID departmentId, UUID attendanceId) {
        SecurityUtils.getCurrentUserId();
        Attendance attendance = findAttendance(workspaceId, departmentId, attendanceId);
        return attendanceMapper.toResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponse> search(UUID workspaceId, UUID departmentId, AttendanceSearchCriteria criteria, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return attendanceRepository.findAll(
                        AttendanceSpecification.withFilter(departmentId, criteria), pageable)
                .map(attendanceMapper::toResponse);
    }

    @Override
    public void delete(UUID workspaceId, UUID departmentId, UUID attendanceId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Attendance attendance = findAttendance(workspaceId, departmentId, attendanceId);

        attendanceRepository.delete(attendance);
        log.info("Attendance record {} deleted by user {}", attendanceId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceStatistics getStatistics(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        AttendanceStatistics stats = new AttendanceStatistics();

        long total = attendanceRepository.countByEmployee_Department_Id(departmentId);
        stats.setTotalRecords(total);

        stats.setPresentDays(countByStatus(departmentId, AttendanceStatus.PRESENT));
        stats.setAbsentDays(countByStatus(departmentId, AttendanceStatus.ABSENT));
        stats.setLateArrivals(countByStatus(departmentId, AttendanceStatus.LATE));
        stats.setRemoteWorkDays(countByStatus(departmentId, AttendanceStatus.REMOTE));
        stats.setVacationDays(countByStatus(departmentId, AttendanceStatus.VACATION));
        stats.setSickLeaveDays(countByStatus(departmentId, AttendanceStatus.SICK_LEAVE));

        Double avgHours = attendanceRepository.averageWorkedHoursByDepartmentId(departmentId);
        stats.setAverageWorkedHours(avgHours != null ? avgHours : 0);

        stats.setTotalOvertimeHours(attendanceRepository.totalOvertimeByDepartmentId(departmentId));

        long totalWorkDays = total - stats.getVacationDays() - stats.getSickLeaveDays();
        long presentDays = stats.getPresentDays() + stats.getLateArrivals() + stats.getRemoteWorkDays();
        double rate = totalWorkDays > 0 ? (double) presentDays / totalWorkDays * 100 : 0;
        stats.setAttendanceRate(rate);

        Map<AttendanceStatistics.AttendanceStatus, Long> byStatus = new HashMap<>();
        for (Object[] row : attendanceRepository.countByStatusGrouped(departmentId)) {
            AttendanceStatus dbStatus = (AttendanceStatus) row[0];
            AttendanceStatistics.AttendanceStatus statsStatus = AttendanceStatistics.AttendanceStatus.valueOf(dbStatus.name());
            byStatus.put(statsStatus, (Long) row[1]);
        }
        stats.setAttendanceByStatus(byStatus);

        return stats;
    }

    private long countByStatus(UUID departmentId, AttendanceStatus status) {
        return attendanceRepository.countByEmployee_Department_IdAndStatus(departmentId, status);
    }

    private void calculateWorkedHours(Attendance attendance) {
        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
            long minutes = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime()).toMinutes();
            long breakMinutes = attendance.getBreakDuration() != null ? attendance.getBreakDuration() : 0;
            double hours = (minutes - breakMinutes) / 60.0;
            attendance.setWorkedHours(Math.max(0, hours));
        }
    }

    private void calculateOvertime(Attendance attendance) {
        if (attendance.getWorkedHours() != null) {
            double overtime = Math.max(0, attendance.getWorkedHours() - STANDARD_WORKING_HOURS);
            attendance.setOvertimeHours(overtime);
        }
    }

    private Attendance findAttendance(UUID workspaceId, UUID departmentId, UUID attendanceId) {
        findActiveDepartment(workspaceId, departmentId);
        return attendanceRepository.findByIdAndEmployee_Department_Id(attendanceId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found."));
    }

    private Employee findActiveEmployee(UUID workspaceId, UUID departmentId, UUID employeeId) {
        findActiveDepartment(workspaceId, departmentId);
        Employee employee = employeeRepository.findByIdAndDepartment_Id(employeeId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
        if (employee.getEmploymentStatus() == EmploymentStatus.TERMINATED
                || employee.getEmploymentStatus() == EmploymentStatus.RESIGNED
                || employee.getEmploymentStatus() == EmploymentStatus.RETIRED) {
            throw new ResourceNotFoundException("Employee not found.");
        }
        return employee;
    }

    private void findActiveDepartment(UUID workspaceId, UUID departmentId) {
        departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .filter(dept -> dept.getStatus() == WorkspaceStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
    }

    private void createEventLog(Employee employee, String eventType, String previousValue,
                                String newValue, String description) {
        EmployeeEventLog log = EmployeeEventLog.builder()
                .employee(employee)
                .eventType(eventType)
                .previousValue(previousValue)
                .newValue(newValue)
                .description(description)
                .build();
        employeeEventLogRepository.save(log);
    }
}
