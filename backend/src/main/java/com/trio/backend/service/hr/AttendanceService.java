package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.AttendanceResponse;
import com.trio.backend.dto.hr.AttendanceSearchCriteria;
import com.trio.backend.dto.hr.AttendanceStatistics;
import com.trio.backend.dto.hr.CheckInRequest;
import com.trio.backend.dto.hr.CheckOutRequest;
import com.trio.backend.dto.hr.CreateAttendanceRequest;
import com.trio.backend.dto.hr.UpdateAttendanceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AttendanceService {

    AttendanceResponse checkIn(UUID workspaceId, UUID departmentId, UUID employeeId, CheckInRequest request);

    AttendanceResponse checkOut(UUID workspaceId, UUID departmentId, UUID employeeId, CheckOutRequest request);

    AttendanceResponse create(UUID workspaceId, UUID departmentId, UUID employeeId, CreateAttendanceRequest request);

    AttendanceResponse update(UUID workspaceId, UUID departmentId, UUID attendanceId, UpdateAttendanceRequest request);

    AttendanceResponse getById(UUID workspaceId, UUID departmentId, UUID attendanceId);

    Page<AttendanceResponse> search(UUID workspaceId, UUID departmentId, AttendanceSearchCriteria criteria, Pageable pageable);

    void delete(UUID workspaceId, UUID departmentId, UUID attendanceId);

    AttendanceStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
