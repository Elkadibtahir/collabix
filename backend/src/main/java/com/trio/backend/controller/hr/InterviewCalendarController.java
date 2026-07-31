package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.InterviewResponse;
import com.trio.backend.dto.hr.InterviewStatistics;
import com.trio.backend.service.hr.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/interviews")
@RequiredArgsConstructor
public class InterviewCalendarController {

    private final InterviewService interviewService;

    @GetMapping("/today")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'INTERVIEW_CALENDAR_VIEW')")
    public ApiResponse<List<InterviewResponse>> getTodayInterviews(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Today's interviews resorteved successfully.",
                interviewService.getTodayInterviews(workspaceId, departmentId));
    }

    @GetMapping("/week")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'INTERVIEW_CALENDAR_VIEW')")
    public ApiResponse<List<InterviewResponse>> getThisWeekInterviews(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("This week's interviews resorteved successfully.",
                interviewService.getThisWeekInterviews(workspaceId, departmentId));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'INTERVIEW_CALENDAR_VIEW')")
    public ApiResponse<List<InterviewResponse>> getUpcomingInterviews(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Upcoming interviews resorteved successfully.",
                interviewService.getUpcomingInterviews(workspaceId, departmentId));
    }

    @GetMapping("/Completed")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'INTERVIEW_CALENDAR_VIEW')")
    public ApiResponse<List<InterviewResponse>> getCompletedInterviews(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Completed interviews resorteved successfully.",
                interviewService.getCompletedInterviews(workspaceId, departmentId));
    }

    @GetMapping("/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'INTERVIEW_CALENDAR_VIEW')")
    public ApiResponse<InterviewStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Interview statistics resorteved successfully.",
                interviewService.getStatistics(workspaceId, departmentId));
    }
}
