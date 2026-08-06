package com.trio.backend.service.hr;

import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.Department;
import com.trio.backend.entity.EmployeeDocument;
import com.trio.backend.entity.EmployeeSkill;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.Notification.NotificationStatus;
import com.trio.backend.entity.Workspace;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.mapper.NotificationMapper;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.EmployeeDocumentRepository;
import com.trio.backend.repository.EmployeeSkillRepository;
import com.trio.backend.repository.NotificationRepository;
import com.trio.backend.repository.UserRepository;
import com.trio.backend.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

/**
 * Sends CERTIFICATION_EXPIRING notifications to employees whose documents or
 * certifications expire within the warning window. De-duplicated so each
 * expiring resource only triggers one notification per window.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HrExpiryScheduler {

    private static final int WARNING_DAYS = 30;
    private static final long REMINDER_COOLDOWN_DAYS = 25;

    private final WorkspaceRepository workspaceRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeDocumentRepository documentRepository;
    private final EmployeeSkillRepository skillRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void sendExpiryNotifications() {
        LocalDate now = LocalDate.now();
        LocalDate warningDate = now.plusDays(WARNING_DAYS);
        Instant cooldownSince = LocalDateTime.now().minusDays(REMINDER_COOLDOWN_DAYS)
                .atZone(ZoneId.systemDefault()).toInstant();

        List<Workspace> activeWorkspaces = workspaceRepository.findAllActive();
        int sent = 0;

        for (Workspace workspace : activeWorkspaces) {
            List<Department> departments = departmentRepository.findAllByWorkspace_IdAndStatus(
                    workspace.getId(), WorkspaceStatus.ACTIVE);

            for (Department department : departments) {
                sent += notifyExpiringDocuments(workspace, department, now, warningDate, cooldownSince);
                sent += notifyExpiringCertifications(workspace, department, warningDate, cooldownSince);
            }
        }

        if (sent > 0) {
            log.info("Sent {} document/certification expiry notifications", sent);
        }
    }

    private int notifyExpiringDocuments(Workspace workspace, Department department,
                                        LocalDate now, LocalDate warningDate, Instant cooldownSince) {
        List<EmployeeDocument> expiring = documentRepository.findExpiringByDepartmentId(
                department.getId(), now, warningDate);
        int sent = 0;
        for (EmployeeDocument doc : expiring) {
            String email = doc.getEmployee().getEmail();
            if (email == null || doc.getExpirationDate() == null) {
                continue;
            }
            var user = userRepository.findByEmail(email);
            if (user.isEmpty()) {
                continue;
            }
            if (notificationRepository.existsSince(user.get().getId(), Notification.NotificationType.CERTIFICATION_EXPIRING,
                    doc.getId(), cooldownSince)) {
                continue;
            }
            saveNotification(workspace, user.get(), Notification.NotificationType.CERTIFICATION_EXPIRING,
                    "Document expiring soon", doc.getOriginalFileName() + " expires on " + doc.getExpirationDate(),
                    "EMPLOYEE_DOCUMENT", doc.getId());
            sent++;
        }
        return sent;
    }

    private int notifyExpiringCertifications(Workspace workspace, Department department,
                                             LocalDate warningDate, Instant cooldownSince) {
        List<EmployeeSkill> expiring = skillRepository.findExpiringCertificationsByDepartmentId(
                department.getId(), LocalDate.now(), warningDate);
        int sent = 0;
        for (EmployeeSkill skill : expiring) {
            String email = skill.getEmployee().getEmail();
            if (email == null || skill.getCertificationExpiration() == null) {
                continue;
            }
            var user = userRepository.findByEmail(email);
            if (user.isEmpty()) {
                continue;
            }
            if (notificationRepository.existsSince(user.get().getId(), Notification.NotificationType.CERTIFICATION_EXPIRING,
                    skill.getId(), cooldownSince)) {
                continue;
            }
            saveNotification(workspace, user.get(), Notification.NotificationType.CERTIFICATION_EXPIRING,
                    "Certification expiring soon", skill.getCertificationName() + " expires on " + skill.getCertificationExpiration(),
                    "EMPLOYEE_SKILL", skill.getId());
            sent++;
        }
        return sent;
    }

    private void saveNotification(Workspace workspace, com.trio.backend.entity.User recipient,
                                  Notification.NotificationType type, String title, String body,
                                  String resourceType, java.util.UUID resourceId) {
        CreateNotificationRequest req = new CreateNotificationRequest();
        req.setRecipientId(recipient.getId());
        req.setNotificationType(type);
        req.setTitle(title);
        req.setBody(body);
        req.setResourceType(resourceType);
        req.setResourceId(resourceId);

        Notification notification = notificationMapper.toEntity(req);
        notification.setWorkspace(workspace);
        notification.setRecipient(recipient);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setPriority("NORMAL");
        notificationRepository.save(notification);
    }
}
