package com.trio.backend.service.cyber;

import com.trio.backend.dto.cyber.CreateSecurityAuditRequest;
import com.trio.backend.dto.cyber.SecurityAuditResponse;
import com.trio.backend.dto.cyber.SecurityAuditSearchCriteria;
import com.trio.backend.dto.cyber.SecurityAuditStatistics;
import com.trio.backend.dto.cyber.UpdateSecurityAuditRequest;
import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.Project;
import com.trio.backend.entity.SecurityAudit;
import com.trio.backend.entity.Team;
import com.trio.backend.enums.AuditStatus;
import com.trio.backend.enums.AuditType;
import com.trio.backend.enums.TaskStatus;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.SecurityAuditMapper;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.ProjectRepository;
import com.trio.backend.repository.SecurityAuditRepository;
import com.trio.backend.repository.SecurityAuditSpecification;
import com.trio.backend.repository.TaskRepository;
import com.trio.backend.repository.TeamRepository;
import com.trio.backend.service.NotificationService;
import com.trio.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SecurityAuditServiceImpl implements SecurityAuditService {

    private final SecurityAuditRepository securityAuditRepository;
    private final ProjectRepository projectRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final SecurityAuditMapper securityAuditMapper;

    @Override
    public SecurityAuditResponse create(UUID workspaceId, UUID departmentId, CreateSecurityAuditRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        Project project = projectRepository.findByIdAndDepartment_Id(request.getProjectId(), departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (project.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Project not found.");
        }

        if (request.getEndDate() != null && request.getStartDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        if (securityAuditRepository.existsByProject_IdAndName(request.getProjectId(),
                request.getName().trim().toLowerCase())) {
            throw new ConflictException("A security audit with this name already exists in the project.");
        }

        Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findByIdAndDepartment_Id(request.getTeamId(), departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found."));
        }

        SecurityAudit audit = SecurityAudit.builder()
                .department(project.getDepartment())
                .project(project)
                .team(team)
                .name(request.getName().trim())
                .description(request.getDescription())
                .auditType(request.getAuditType())
                .priority(request.getPriority())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(AuditStatus.PLANNED)
                .build();

        SecurityAudit saved = securityAuditRepository.save(audit);
        log.info("Security audit {} created for project {} by user {}",
                saved.getId(), project.getId(), userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.AUDIT_CREATED);
        notifReq.setTitle("Security audit created");
        notifReq.setBody("Security audit \"" + saved.getName() + "\" has been created for project " + project.getName() + ".");
        notificationService.create(workspaceId, notifReq);

        return securityAuditMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SecurityAuditResponse getById(UUID workspaceId, UUID departmentId, UUID auditId) {
        SecurityUtils.getCurrentUserId();
        SecurityAudit audit = findAudit(workspaceId, departmentId, auditId);
        return securityAuditMapper.toResponse(audit);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SecurityAuditResponse> search(UUID workspaceId, UUID departmentId,
                                              SecurityAuditSearchCriteria criteria, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return securityAuditRepository.findAll(
                        SecurityAuditSpecification.withFilter(departmentId, criteria), pageable)
                .map(securityAuditMapper::toResponse);
    }

    @Override
    public SecurityAuditResponse update(UUID workspaceId, UUID departmentId, UUID auditId, UpdateSecurityAuditRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        SecurityAudit audit = findAudit(workspaceId, departmentId, auditId);

        if (audit.getStatus() == AuditStatus.COMPLETED
                || audit.getStatus() == AuditStatus.ARCHIVED) {
            throw new BadRequestException("Cannot modify a Completed or archived security audit.");
        }

        if (request.getTeamId() != null) {
            Team team = teamRepository.findByIdAndDepartment_Id(request.getTeamId(), departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found."));
            audit.setTeam(team);
        }
        if (request.getName() != null) audit.setName(request.getName().trim());
        if (request.getDescription() != null) audit.setDescription(request.getDescription());
        if (request.getAuditType() != null) audit.setAuditType(request.getAuditType());
        if (request.getPriority() != null) audit.setPriority(request.getPriority());
        if (request.getStartDate() != null) audit.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) audit.setEndDate(request.getEndDate());

        if (audit.getStartDate() != null && audit.getEndDate() != null
                && audit.getEndDate().isBefore(audit.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        SecurityAudit saved = securityAuditRepository.save(audit);
        log.info("Security audit {} updated by user {}", auditId, userId);

        return securityAuditMapper.toResponse(saved);
    }

    @Override
    public SecurityAuditResponse start(UUID workspaceId, UUID departmentId, UUID auditId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        SecurityAudit audit = findAudit(workspaceId, departmentId, auditId);

        if (audit.getStatus() != AuditStatus.PLANNED) {
            throw new BadRequestException("Only planned security audits can be started.");
        }

        audit.setStatus(AuditStatus.IN_PROGRESS);
        if (audit.getStartDate() == null) {
            audit.setStartDate(LocalDate.now());
        }
        SecurityAudit saved = securityAuditRepository.save(audit);

        log.info("Security audit {} started by user {}", auditId, userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.AUDIT_STARTED);
        notifReq.setTitle("Security audit started");
        notifReq.setBody("Security audit \"" + saved.getName() + "\" is now in progress.");
        notificationService.create(workspaceId, notifReq);

        return securityAuditMapper.toResponse(saved);
    }

    @Override
    public SecurityAuditResponse complete(UUID workspaceId, UUID departmentId, UUID auditId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        SecurityAudit audit = findAudit(workspaceId, departmentId, auditId);

        if (audit.getStatus() != AuditStatus.IN_PROGRESS && audit.getStatus() != AuditStatus.UNDER_REVIEW) {
            throw new BadRequestException("Only security audits in progress or under review can be Completed.");
        }

        updateAuditmetrics(audit);

        audit.setStatus(AuditStatus.COMPLETED);
        audit.setCompletedAt(LocalDate.now());
        SecurityAudit saved = securityAuditRepository.save(audit);

        log.info("Security audit {} Completed by user {}", auditId, userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.AUDIT_COMPLETED);
        notifReq.setTitle("Security audit Completed");
        notifReq.setBody("Security audit \"" + saved.getName() + "\" has been Completed. "
                + "Completion: " + (saved.getCompletionPercentage() != null ? Math.round(saved.getCompletionPercentage()) : 0) + "%.");
        notificationService.create(workspaceId, notifReq);

        return securityAuditMapper.toResponse(saved);
    }

    @Override
    public SecurityAuditResponse archive(UUID workspaceId, UUID departmentId, UUID auditId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        SecurityAudit audit = findAudit(workspaceId, departmentId, auditId);

        if (audit.getStatus() == AuditStatus.ARCHIVED) {
            throw new BadRequestException("Security audit is already archived.");
        }

        audit.setStatus(AuditStatus.ARCHIVED);
        SecurityAudit saved = securityAuditRepository.save(audit);

        log.info("Security audit {} archived by user {}", auditId, userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.AUDIT_ARCHIVED);
        notifReq.setTitle("Security audit archived");
        notifReq.setBody("Security audit \"" + saved.getName() + "\" has been archived.");
        notificationService.create(workspaceId, notifReq);

        return securityAuditMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SecurityAuditStatistics getStatistics(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        SecurityAuditStatistics stats = new SecurityAuditStatistics();
        long total = securityAuditRepository.countByDepartment_Id(departmentId);
        stats.setTotalAudits(total);

        stats.setActiveAudits(securityAuditRepository.countByDepartment_IdAndStatus(departmentId, AuditStatus.IN_PROGRESS));
        stats.setCompletedAudits(securityAuditRepository.countByDepartment_IdAndStatus(departmentId, AuditStatus.COMPLETED));
        stats.setPlannedAudits(securityAuditRepository.countByDepartment_IdAndStatus(departmentId, AuditStatus.PLANNED));
        stats.setArchivedAudits(securityAuditRepository.countByDepartment_IdAndStatus(departmentId, AuditStatus.ARCHIVED));

        List<SecurityAudit> CompletedWithDates = securityAuditRepository.findCompletedWithDates(departmentId);
        double avgCompletionTime = 0;
        if (!CompletedWithDates.isEmpty()) {
            avgCompletionTime = CompletedWithDates.stream()
                    .mapToLong(a -> ChronoUnit.DAYS.between(a.getStartDate(), a.getCompletedAt()))
                    .average()
                    .orElse(0);
        }
        stats.setAverageCompletionTimeDays(avgCompletionTime);

        List<SecurityAudit> withPct = securityAuditRepository.findWithcompletionPercentage(departmentId);
        double avgPct = 0;
        if (!withPct.isEmpty()) {
            avgPct = withPct.stream()
                    .mapToDouble(a -> a.getCompletionPercentage() != null ? a.getCompletionPercentage() : 0)
                    .average()
                    .orElse(0);
        }
        stats.setAverageCompletionPercentage(avgPct);

        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : securityAuditRepository.countByStatusGrouped(departmentId)) {
            byStatus.put(((AuditStatus) row[0]).name(), (Long) row[1]);
        }
        stats.setAuditsByStatus(byStatus);

        Map<String, Long> byProject = new HashMap<>();
        for (Object[] row : securityAuditRepository.countByProjectGrouped(departmentId)) {
            byProject.put((String) row[1], (Long) row[2]);
        }
        stats.setAuditsByProject(byProject);

        Map<String, Long> byTeam = new HashMap<>();
        for (Object[] row : securityAuditRepository.countByTeamGrouped(departmentId)) {
            byTeam.put((String) row[0], (Long) row[1]);
        }
        stats.setAuditsByTeam(byTeam);

        return stats;
    }

    private void updateAuditmetrics(SecurityAudit audit) {
        UUID auditId = audit.getId();

        long totalTasks = taskRepository.countBySecurityAudit_Id(auditId);
        long CompletedTasks = taskRepository.countBySecurityAudit_IdAndStatus(auditId, TaskStatus.COMPLETED);

        audit.setTotalTasks((int) totalTasks);
        audit.setCompletedTasks((int) CompletedTasks);

        if (totalTasks > 0) {
            double pct = (double) CompletedTasks / totalTasks * 100;
            audit.setCompletionPercentage(Math.round(pct * 100.0) / 100.0);
        } else {
            audit.setCompletionPercentage(0.0);
        }
    }

    private SecurityAudit findAudit(UUID workspaceId, UUID departmentId, UUID auditId) {
        findActiveDepartment(workspaceId, departmentId);
        return securityAuditRepository.findByIdAndDepartment_Id(auditId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Security audit not found."));
    }

    private void findActiveDepartment(UUID workspaceId, UUID departmentId) {
        departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .filter(dept -> dept.getStatus() == WorkspaceStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
    }
}
