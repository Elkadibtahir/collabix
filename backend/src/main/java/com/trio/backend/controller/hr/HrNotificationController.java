package com.trio.backend.controller.hr;

import com.trio.backend.common.ApiResponse;
import com.trio.backend.dto.hr.HrNotificationSearchCriteria;
import com.trio.backend.dto.hr.HrNotificationStatistics;
import com.trio.backend.dto.notification.NotificationResponse;
import com.trio.backend.service.hr.HrNotificationService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/departments/{departmentId}/notifications")
@RequiredArgsConstructor
public class HrNotificationController {

    private final HrNotificationService hrNotificationService;

    @GetMapping
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HR_NOTIFICATION_READ')")
    public ApiResponse<Page<NotificationResponse>> search(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            HrNotificationSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success("Notifications resorteved successfully.",
                hrNotificationService.search(workspaceId, departmentId, criteria, pageable));
    }

    @GetMapping("/{notificationId}")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HR_NOTIFICATION_READ')")
    public ApiResponse<NotificationResponse> getById(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID notificationId) {
        return ApiResponse.success("Notification resorteved successfully.",
                hrNotificationService.getById(workspaceId, departmentId, notificationId));
    }

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HR_NOTIFICATION_DISMISS')")
    public ApiResponse<NotificationResponse> markAsRead(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID notificationId) {
        return ApiResponse.success("Notification marked as read.",
                hrNotificationService.markAsRead(workspaceId, departmentId, notificationId));
    }

    @PutMapping("/read-all")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HR_NOTIFICATION_DISMISS')")
    public ApiResponse<Void> markAllAsRead(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @RequestParam UUID recipientId) {
        hrNotificationService.markAllAsRead(workspaceId, departmentId, recipientId);
        return ApiResponse.success("All notifications marked as read.");
    }

    @PutMapping("/{notificationId}/dismiss")
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HR_NOTIFICATION_DISMISS')")
    public ApiResponse<NotificationResponse> dismiss(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID notificationId) {
        return ApiResponse.success("Notification dismissed.",
                hrNotificationService.dismiss(workspaceId, departmentId, notificationId));
    }

    @DeleteMapping("/{notificationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@workspaceAuth.canManageDepartmentHR(#workspaceId, #departmentId, authentication) && @permissionEvaluator.hasPermission(authentication, 'NOTIFICATION_DELETE')")
    public void delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId,
            @PathVariable UUID notificationId) {
        hrNotificationService.delete(workspaceId, departmentId, notificationId);
    }

    @GetMapping("/stats")
    @PreAuthorize("@workspaceAuth.canViewWorkspace(#workspaceId, authentication) && @permissionEvaluator.hasPermission(authentication, 'HR_NOTIFICATION_READ')")
    public ApiResponse<HrNotificationStatistics> getStatistics(
            @PathVariable UUID workspaceId,
            @PathVariable UUID departmentId) {
        return ApiResponse.success("Notification statistics resorteved successfully.",
                hrNotificationService.getStatistics(workspaceId, departmentId));
    }
}
