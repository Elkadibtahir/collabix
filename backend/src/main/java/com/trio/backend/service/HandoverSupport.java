package com.trio.backend.service;

import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.HandoverEntry;
import com.trio.backend.entity.HandoverTimelineEvent;
import com.trio.backend.entity.HandoverTimelineEvent.TimelineEventType;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.User;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.repository.HandoverTimelineEventRepository;
import com.trio.backend.repository.WorkspaceMemberRepository;
import com.trio.backend.repository.WorkspaceRepository;
import com.trio.backend.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Shared helpers for the Handover module: authentication, workspace membership,
 * timeline events and notifications.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HandoverSupport {

    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final HandoverTimelineEventRepository timelineEventRepository;
    private final NotificationService notificationService;

    public UUID currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails main)) {
            throw new BadRequestException("User is not authenticated.");
        }
        return main.getId();
    }

    public void assertActiveWorkspaceMember(UUID workspaceId, UUID userId) {
        WorkspaceMember wm = workspaceMemberRepository
                .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace."));
        if (wm.getStatus() != WorkspaceMemberStatus.ACTIVE) {
            throw new ForbiddenException("You are not an active member of this workspace.");
        }
    }

    public void assertUserIsActiveMember(UUID workspaceId, UUID userId, String message) {
        WorkspaceMember wm = workspaceMemberRepository
                .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspaceId, userId)
                .orElseThrow(() -> new BadRequestException(message));
        if (wm.getStatus() != WorkspaceMemberStatus.ACTIVE) {
            throw new BadRequestException(message);
        }
    }

    public boolean isWorkspaceAdminOrOwner(UUID workspaceId, UUID userId) {
        boolean isAdmin = workspaceMemberRepository.existsWithRole(workspaceId, userId, WorkspaceRole.ADMIN);
        boolean isOwner = workspaceRepository.findById(workspaceId)
                .map(ws -> ws.getOwner().getId().equals(userId))
                .orElse(false);
        return isAdmin || isOwner;
    }

    public void addTimelineEvent(HandoverEntry entry, TimelineEventType type, String description, UUID actorId) {
        HandoverTimelineEvent event = HandoverTimelineEvent.builder()
                .handoverEntry(entry)
                .eventType(type)
                .description(description)
                .actorId(actorId)
                .build();
        timelineEventRepository.save(event);
    }

    public void notifyUser(UUID workspaceId, UUID recipientId, Notification.NotificationType type,
                           String title, String body, UUID handoverId) {
        try {
            CreateNotificationRequest notif = new CreateNotificationRequest();
            notif.setWorkspaceId(workspaceId);
            notif.setRecipientId(recipientId);
            notif.setNotificationType(type);
            notif.setTitle(title);
            notif.setBody(body);
            notif.setLinkUrl("/handovers/" + handoverId);
            notif.setResourceType("HANDOVER");
            notif.setResourceId(handoverId);
            notif.setHandoverEntryId(handoverId);
            notificationService.create(workspaceId, notif);
        } catch (Exception e) {
            log.warn("Failed to send handover notification to {}: {}", recipientId, e.getMessage());
        }
    }

    public String userDisplayName(User user) {
        if (user == null) {
            return "unknown";
        }
        String first = user.getFirstName() == null ? "" : user.getFirstName();
        String last = user.getLastName() == null ? "" : user.getLastName();
        return (first + " " + last).trim();
    }
}
