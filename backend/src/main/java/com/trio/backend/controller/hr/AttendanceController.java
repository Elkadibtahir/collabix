package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.AttendanceResponse;
import com.trio.backend.dto.hr.AttendanceSearchCriteria;
import com.trio.backend.dto.hr.AttendanceStatistics;
import com.trio.backend.dto.hr.CheckInRequest;
import com.trio.backend.dto.hr.CheckOutRequest;
import com.trio.backend.dto.hr.CreateAttendanceRequest;
import com.trio.backend.dto.hr.UpdateAttendanceRequest;
import com.trio.backend.service.hr.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/employees/{employeeId}/attendance/check-in")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'ATTENDANCE_CREATE')")
    public ApiResponse<AttendanceResponse> checkIn(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @Valid @RequestBody CheckInRequest request) {
        return ApiResponse.success("Check-in recorded successfully.",
                attendanceService.checkIn(workspaceId, departmentId, employeeId, request));
    }

    @PostMapping("/employees/{employeeId}/attendance/check-out")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'ATTENDANCE_CREATE')")
    public ApiResponse<AttendanceResponse> checkOut(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @Valid @RequestBody CheckOutRequest request) {
        return ApiResponse.success("Check-out recorded successfully.",
                attendanceService.checkOut(workspaceId, departmentId, employeeId, request));
    }

    @PostMapping("/employees/{employeeId}/attendance")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'ATTENDANCE_CREATE')")
    public ApiResponse<AttendanceResponse> create(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            @Valid @RequestBody CreateAttendanceRequest request) {
        return ApiResponse.success("Attendance record created successfully.",
                attendanceService.create(workspaceId, departmentId, employeeId, request));
    }

    @GetMapping("/employees/{employeeId}/attendance")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'ATTENDANCE_READ')")
    public ApiResponse<Page<AttendanceResponse>> getEmployeeHistory(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId,
            AttendanceSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        criteria.setEmployeeId(employeeId);
        return ApiResponse.success("Attendance records resorteved successfully.",
                attendanceService.search(workspaceId, departmentId, criteria, pageable));
    }

    @GetMapping("/attendance/{attendanceId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'ATTENDANCE_READ')")
    public ApiResponse<AttendanceResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID attendanceId) {
        return ApiResponse.success("Attendance record resorteved successfully.",
                attendanceService.getById(workspaceId, departmentId, attendanceId));
    }

    @GetMapping("/attendance")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'ATTENDANCE_READ')")
    public ApiResponse<Page<AttendanceResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            AttendanceSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Attendance records resorteved successfully.",
                attendanceService.search(workspaceId, departmentId, criteria, pageable));
    }

    @PutMapping("/attendance/{attendanceId}")
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'ATTENDANCE_UPDATE')")
    public ApiResponse<AttendanceResponse> update(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID attendanceId,
            @Valid @RequestBody UpdateAttendanceRequest request) {
        return ApiResponse.success("Attendance record updated successfully.",
                attendanceService.update(workspaceId, departmentId, attendanceId, request));
    }

    @DeleteMapping("/attendance/{attendanceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canUpdateWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'ATTENDANCE_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID attendanceId) {
        attendanceService.delete(workspaceId, departmentId, attendanceId);
    }

    @GetMapping("/attendance/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'ATTENDANCE_READ')")
    public ApiResponse<AttendanceStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Attendance statistics resorteved successfully.",
                attendanceService.getStatistics(workspaceId, departmentId));
    }
}
