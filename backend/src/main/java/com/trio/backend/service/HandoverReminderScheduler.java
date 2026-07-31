package com.trio.backend.service;

import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.HandoverEntry;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.Workspace;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.repository.HandoverEntryRepository;
import com.trio.backend.repository.WorkspaceMemberRepository;
import com.trio.backend.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class HandoverReminderScheduler {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final HandoverEntryRepository handoverEntryRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 */15 * * * *")
    public void sendShiftEndReminders() {
        LocalTime now = LocalTime.now();

        ReminderCheckpoint checkpoint = getReminderCheckpoint(now);
        if (checkpoint == null) return;

        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        log.info("Handover reminder checkpoint: {} shift ends in {}", checkpoint.shift, checkpoint.timeUntilEnd);

        List<Workspace> activeWorkspaces = workspaceRepository.findAllActive();
        for (Workspace workspace : activeWorkspaces) {
            UUID wsId = workspace.getId();
            List<WorkspaceMember> activeMembers = workspaceMemberRepository
                    .findAllByWorkspace_IdAndStatus(wsId, WorkspaceMemberStatus.ACTIVE);

            for (var member : activeMembers) {
                UUID userId = member.getWorkspaceMemberId().getUserId();

                List<HandoverEntry> todayEnsortes = handoverEntryRepository
                        .findByUserIdAndWorkspaceAndPassedAtBetween(userId, wsId, dayStart, dayEnd);

                boolean hasEntryForShift = todayEnsortes.stream()
                        .anyMatch(e -> e.getShift() == checkpoint.shift);

                if (!hasEntryForShift) {
                    sendReminder(wsId, userId, checkpoint);
                }
            }
        }
    }

    private ReminderCheckpoint getReminderCheckpoint(LocalTime now) {
        int hour = now.getHour();
        int minute = now.getMinute();

        if (hour == 13 && minute == 30) {
            return new ReminderCheckpoint(HandoverEntry.Shift.MORNING, "30 minutes");
        }
        if (hour == 13 && minute == 45) {
            return new ReminderCheckpoint(HandoverEntry.Shift.MORNING, "15 minutes");
        }
        if (hour == 21 && minute == 30) {
            return new ReminderCheckpoint(HandoverEntry.Shift.EVENING, "30 minutes");
        }
        if (hour == 21 && minute == 45) {
            return new ReminderCheckpoint(HandoverEntry.Shift.EVENING, "15 minutes");
        }
        return null;
    }

    private void sendReminder(UUID workspaceId, UUID userId, ReminderCheckpoint checkpoint) {
        CreateNotificationRequest req = new CreateNotificationRequest();
        req.setRecipientId(userId);
        req.setNotificationType(Notification.NotificationType.HANDOVER_REMINDER);
        req.setTitle("Handover Entry Reminder");
        String shiftLabel = checkpoint.shift.name().toLowerCase();
        req.setBody("Your " + shiftLabel + " shift ends in " + checkpoint.timeUntilEnd + ". Please Complete your handover entry.");
        notificationService.create(workspaceId, req);
        log.debug("Sent handover reminder to user {} in workspace {} ({} before {} shift end)",
                userId, workspaceId, checkpoint.timeUntilEnd, shiftLabel);
    }

    private record ReminderCheckpoint(HandoverEntry.Shift shift, String timeUntilEnd) {}
}
