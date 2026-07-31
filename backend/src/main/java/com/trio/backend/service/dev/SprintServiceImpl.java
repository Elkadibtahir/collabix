package com.trio.backend.service.dev;

import com.trio.backend.dto.dev.CreateSprintRequest;
import com.trio.backend.dto.dev.SprintResponse;
import com.trio.backend.dto.dev.SprintSearchCriteria;
import com.trio.backend.dto.dev.SprintStatistics;
import com.trio.backend.dto.dev.UpdateSprintRequest;
import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.Project;
import com.trio.backend.entity.Sprint;
import com.trio.backend.entity.Team;
import com.trio.backend.enums.SprintStatus;
import com.trio.backend.enums.TaskStatus;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.SprintMapper;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.ProjectRepository;
import com.trio.backend.repository.SprintRepository;
import com.trio.backend.repository.SprintSpecification;
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
public class SprintServiceImpl implements SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final SprintMapper sprintMapper;

    @Override
    public SprintResponse create(UUID workspaceId, UUID departmentId, CreateSprintRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        Project project = projectRepository.findByIdAndDepartment_Id(request.getProjectId(), departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (project.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Project not found.");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        if (request.getEndDate().isEqual(request.getStartDate())) {
            throw new BadRequestException("Sprint must be at least one day long.");
        }

        if (sprintRepository.existsByProject_IdAndName(request.getProjectId(), request.getName().trim().toLowerCase())) {
            throw new ConflictException("A sprint with this name already exists in the project.");
        }

        Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findByIdAndDepartment_Id(request.getTeamId(), departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found."));
        }

        Sprint sprint = Sprint.builder()
                .department(project.getDepartment())
                .project(project)
                .team(team)
                .name(request.getName().trim())
                .goal(request.getGoal())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(SprintStatus.PLANNED)
                .capacity(request.getCapacity())
                .build();

        Sprint saved = sprintRepository.save(sprint);
        log.info("Sprint {} created for project {} by user {}",
                saved.getId(), project.getId(), userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.SPRINT_CREATED);
        notifReq.setTitle("Sprint created");
        notifReq.setBody("Sprint \"" + saved.getName() + "\" has been created for project " + project.getName() + ".");
        notificationService.create(workspaceId, notifReq);

        return sprintMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SprintResponse getById(UUID workspaceId, UUID departmentId, UUID sprintId) {
        SecurityUtils.getCurrentUserId();
        Sprint sprint = findSprint(workspaceId, departmentId, sprintId);
        return sprintMapper.toResponse(sprint);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SprintResponse> search(UUID workspaceId, UUID departmentId,
                                        SprintSearchCriteria criteria, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return sprintRepository.findAll(
                        SprintSpecification.withFilter(departmentId, criteria), pageable)
                .map(sprintMapper::toResponse);
    }

    @Override
    public SprintResponse update(UUID workspaceId, UUID departmentId, UUID sprintId, UpdateSprintRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Sprint sprint = findSprint(workspaceId, departmentId, sprintId);

        if (sprint.getStatus() == SprintStatus.COMPLETED
                || sprint.getStatus() == SprintStatus.ARCHIVED
                || sprint.getStatus() == SprintStatus.CANCELLED) {
            throw new BadRequestException("Cannot modify a Completed, archived, or cancelled sprint.");
        }

        if (request.getTeamId() != null) {
            Team team = teamRepository.findByIdAndDepartment_Id(request.getTeamId(), departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found."));
            sprint.setTeam(team);
        }
        if (request.getName() != null) sprint.setName(request.getName().trim());
        if (request.getGoal() != null) sprint.setGoal(request.getGoal());
        if (request.getDescription() != null) sprint.setDescription(request.getDescription());
        if (request.getStartDate() != null) sprint.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) sprint.setEndDate(request.getEndDate());
        if (request.getCapacity() != null) sprint.setCapacity(request.getCapacity());

        if (sprint.getEndDate().isBefore(sprint.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        Sprint saved = sprintRepository.save(sprint);
        log.info("Sprint {} updated by user {}", sprintId, userId);

        return sprintMapper.toResponse(saved);
    }

    @Override
    public SprintResponse activate(UUID workspaceId, UUID departmentId, UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Sprint sprint = findSprint(workspaceId, departmentId, sprintId);

        if (sprint.getStatus() != SprintStatus.PLANNED) {
            throw new BadRequestException("Only planned sprints can be activated.");
        }

        sprint.setStatus(SprintStatus.ACTIVE);
        Sprint saved = sprintRepository.save(sprint);

        log.info("Sprint {} activated by user {}", sprintId, userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.SPRINT_STARTED);
        notifReq.setTitle("Sprint started");
        notifReq.setBody("Sprint \"" + saved.getName() + "\" is now active.");
        notificationService.create(workspaceId, notifReq);

        return sprintMapper.toResponse(saved);
    }

    @Override
    public SprintResponse complete(UUID workspaceId, UUID departmentId, UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Sprint sprint = findSprint(workspaceId, departmentId, sprintId);

        if (sprint.getStatus() != SprintStatus.ACTIVE) {
            throw new BadRequestException("Only active sprints can be Completed.");
        }

        updateSprintmetrics(sprint);

        sprint.setStatus(SprintStatus.COMPLETED);
        Sprint saved = sprintRepository.save(sprint);

        log.info("Sprint {} Completed by user {}", sprintId, userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.SPRINT_COMPLETED);
        notifReq.setTitle("Sprint Completed");
        notifReq.setBody("Sprint \"" + saved.getName() + "\" has been Completed. "
                + "Completion: " + (saved.getCompletionPercentage() != null ? Math.round(saved.getCompletionPercentage()) : 0) + "%.");
        notificationService.create(workspaceId, notifReq);

        return sprintMapper.toResponse(saved);
    }

    @Override
    public SprintResponse archive(UUID workspaceId, UUID departmentId, UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Sprint sprint = findSprint(workspaceId, departmentId, sprintId);

        if (sprint.getStatus() == SprintStatus.ARCHIVED) {
            throw new BadRequestException("Sprint is already archived.");
        }

        sprint.setStatus(SprintStatus.ARCHIVED);
        Sprint saved = sprintRepository.save(sprint);

        log.info("Sprint {} archived by user {}", sprintId, userId);

        CreateNotificationRequest notifReq = new CreateNotificationRequest();
        notifReq.setRecipientId(userId);
        notifReq.setNotificationType(Notification.NotificationType.SPRINT_ARCHIVED);
        notifReq.setTitle("Sprint archived");
        notifReq.setBody("Sprint \"" + saved.getName() + "\" has been archived.");
        notificationService.create(workspaceId, notifReq);

        return sprintMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID workspaceId, UUID departmentId, UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Sprint sprint = findSprint(workspaceId, departmentId, sprintId);

        if (sprint.getStatus() != SprintStatus.PLANNED) {
            throw new BadRequestException("Only planned sprints can be deleted.");
        }

        long taskCount = taskRepository.countBySprint_Id(sprintId);
        if (taskCount > 0) {
            throw new BadRequestException("Cannot delete a sprint that contains tasks. Remove tasks first.");
        }

        sprintRepository.delete(sprint);
        log.info("Sprint {} deleted by user {}", sprintId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public SprintStatistics getStatistics(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        SprintStatistics stats = new SprintStatistics();
        long total = sprintRepository.countByDepartment_Id(departmentId);
        stats.setTotalSprints(total);

        stats.setActiveSprints(sprintRepository.countByDepartment_IdAndStatus(departmentId, SprintStatus.ACTIVE));
        stats.setCompletedSprints(sprintRepository.countByDepartment_IdAndStatus(departmentId, SprintStatus.COMPLETED));
        stats.setPlannedSprints(sprintRepository.countByDepartment_IdAndStatus(departmentId, SprintStatus.PLANNED));
        stats.setCancelledSprints(sprintRepository.countByDepartment_IdAndStatus(departmentId, SprintStatus.CANCELLED));

        List<Sprint> CompletedWithDates = sprintRepository.findCompletedWithDates(departmentId);
        double avgDuration = 0;
        if (!CompletedWithDates.isEmpty()) {
            avgDuration = CompletedWithDates.stream()
                    .mapToLong(s -> ChronoUnit.DAYS.between(s.getStartDate(), s.getEndDate()))
                    .average()
                    .orElse(0);
        }
        stats.setAverageDurationDays(avgDuration);

        List<Sprint> CompletedWithPct = sprintRepository.findCompletedWithPercentage(departmentId);
        double avgRate = 0;
        if (!CompletedWithPct.isEmpty()) {
            avgRate = CompletedWithPct.stream()
                    .mapToDouble(s -> s.getCompletionPercentage() != null ? s.getCompletionPercentage() : 0)
                    .average()
                    .orElse(0);
        }
        stats.setAverageCompletionRate(avgRate);

        List<Sprint> CompletedWithVel = sprintRepository.findCompletedWithVelocity(departmentId);
        double avgVel = 0;
        if (!CompletedWithVel.isEmpty()) {
            avgVel = CompletedWithVel.stream()
                    .mapToDouble(s -> s.getVelocity() != null ? s.getVelocity() : 0)
                    .average()
                    .orElse(0);
        }
        stats.setAverageVelocity(avgVel);

        List<Sprint> withTasks = sprintRepository.findWithTaskCount(departmentId);
        double avgTasks = 0;
        if (!withTasks.isEmpty()) {
            avgTasks = withTasks.stream()
                    .mapToInt(s -> s.getTotalTasks() != null ? s.getTotalTasks() : 0)
                    .average()
                    .orElse(0);
        }
        stats.setAverageTasksPerSprint(avgTasks);

        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : sprintRepository.countByStatusGrouped(departmentId)) {
            byStatus.put(((SprintStatus) row[0]).name(), (Long) row[1]);
        }
        stats.setSprintsByStatus(byStatus);

        Map<String, Long> byProject = new HashMap<>();
        for (Object[] row : sprintRepository.countByProjectGrouped(departmentId)) {
            byProject.put((String) row[1], (Long) row[2]);
        }
        stats.setSprintsByProject(byProject);

        return stats;
    }

    private void updateSprintmetrics(Sprint sprint) {
        UUID sprintId = sprint.getId();

        long totalTasks = taskRepository.countBySprint_Id(sprintId);
        long CompletedTasks = taskRepository.countBySprint_IdAndStatus(sprintId, TaskStatus.COMPLETED);
        int totalSp = taskRepository.sumStoryPointsBySprint_Id(sprintId);
        int CompletedSp = taskRepository.sumStoryPointsBySprint_IdAndStatus(sprintId, TaskStatus.COMPLETED);

        sprint.setTotalTasks((int) totalTasks);
        sprint.setCompletedTasks((int) CompletedTasks);
        sprint.setTotalStoryPoints(totalSp);
        sprint.setCompletedStoryPoints(CompletedSp);

        if (totalTasks > 0) {
            double pct = (double) CompletedTasks / totalTasks * 100;
            sprint.setCompletionPercentage(Math.round(pct * 100.0) / 100.0);
        } else {
            sprint.setCompletionPercentage(0.0);
        }

        long durationDays = ChronoUnit.DAYS.between(sprint.getStartDate(), sprint.getEndDate());
        if (durationDays > 0) {
            double vel = (double) CompletedSp / durationDays;
            sprint.setVelocity(Math.round(vel * 100.0) / 100.0);
        } else {
            sprint.setVelocity(0.0);
        }
    }

    private Sprint findSprint(UUID workspaceId, UUID departmentId, UUID sprintId) {
        findActiveDepartment(workspaceId, departmentId);
        return sprintRepository.findByIdAndDepartment_Id(sprintId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found."));
    }

    private void findActiveDepartment(UUID workspaceId, UUID departmentId) {
        departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .filter(dept -> dept.getStatus() == WorkspaceStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
    }
}
