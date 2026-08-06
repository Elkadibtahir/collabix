package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.CreateOnboardingRequest;
import com.trio.backend.dto.hr.CreateOnboardingTaskRequest;
import com.trio.backend.dto.hr.OnboardingResponse;
import com.trio.backend.dto.hr.OnboardingSearchCriteria;
import com.trio.backend.dto.hr.OnboardingStatistics;
import com.trio.backend.dto.hr.OnboardingTaskResponse;
import com.trio.backend.dto.hr.UpdateOnboardingRequest;
import com.trio.backend.dto.hr.UpdateOnboardingTaskRequest;
import com.trio.backend.dto.notification.CreateNotificationRequest;
import com.trio.backend.entity.Employee;
import com.trio.backend.entity.Notification;
import com.trio.backend.entity.EmployeeEventLog;
import com.trio.backend.entity.Onboarding;
import com.trio.backend.entity.OnboardingTask;
import com.trio.backend.enums.EmploymentStatus;
import com.trio.backend.enums.OnboardingStatus;
import com.trio.backend.enums.OnboardingTaskStatus;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.OnboardingMapper;
import com.trio.backend.mapper.OnboardingTaskMapper;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.EmployeeEventLogRepository;
import com.trio.backend.repository.EmployeeRepository;
import com.trio.backend.repository.OnboardingRepository;
import com.trio.backend.repository.OnboardingSpecification;
import com.trio.backend.repository.OnboardingTaskRepository;
import com.trio.backend.repository.UserRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OnboardingServiceImpl implements OnboardingService {

    private final OnboardingRepository onboardingRepository;
    private final OnboardingTaskRepository onboardingTaskRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeEventLogRepository employeeEventLogRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final OnboardingMapper onboardingMapper;
    private final OnboardingTaskMapper taskMapper;

    @Override
    public OnboardingResponse create(UUID workspaceId, UUID departmentId, CreateOnboardingRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Employee employee = findActiveEmployee(workspaceId, departmentId, request.getEmployeeId());

        if (onboardingRepository.existsByEmployee_IdAndStatusNot(request.getEmployeeId(), OnboardingStatus.CANCELLED)) {
            throw new ConflictException("An onboarding process already exists for this employee.");
        }

        if (request.getExpectedCompletionDate() != null
                && request.getExpectedCompletionDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Expected Completion date cannot be before start date.");
        }

        Onboarding saved = onboardingRepository.findByEmployee_Id(request.getEmployeeId())
                .filter(onboarding -> onboarding.getStatus() == OnboardingStatus.CANCELLED)
                .map(onboarding -> {
                    onboarding.setStatus(OnboardingStatus.NOT_STARTED);
                    onboarding.setStartDate(request.getStartDate());
                    onboarding.setExpectedCompletionDate(request.getExpectedCompletionDate());
                    onboarding.setActualCompletionDate(null);
                    onboarding.setAssignedHrId(request.getAssignedHrId());
                    onboarding.setAssignedManagerId(request.getAssignedManagerId());
                    onboarding.setNotes(request.getNotes());
                    onboarding.getTasks().clear();
                    return onboardingRepository.save(onboarding);
                })
                .orElseGet(() -> {
                    Onboarding onboarding = Onboarding.builder()
                            .employee(employee)
                            .status(OnboardingStatus.NOT_STARTED)
                            .startDate(request.getStartDate())
                            .expectedCompletionDate(request.getExpectedCompletionDate())
                            .assignedHrId(request.getAssignedHrId())
                            .assignedManagerId(request.getAssignedManagerId())
                            .notes(request.getNotes())
                            .build();
                    return onboardingRepository.save(onboarding);
                });
        log.info("Onboarding created for employee {} by user {}",
                employee.getId(), userId);

        createEventLog(employee, "ONBOARDING_CREATED", null, saved.getId().toString(),
                "Onboarding started for " + employee.getFirstName() + " " + employee.getLastName());

        notifyOnboarding(workspaceId, employee, Notification.NotificationType.ONBOARDING_STARTED,
                "Onboarding started", "Your onboarding has started. Welcome to the team!");

        return onboardingMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OnboardingResponse getById(UUID workspaceId, UUID departmentId, UUID onboardingId) {
        SecurityUtils.getCurrentUserId();
        Onboarding onboarding = findOnboarding(workspaceId, departmentId, onboardingId);
        return onboardingMapper.toResponse(onboarding);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OnboardingResponse> list(UUID workspaceId, UUID departmentId, OnboardingSearchCriteria criteria, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return onboardingRepository.findAll(
                        OnboardingSpecification.withFilter(departmentId, criteria), pageable)
                .map(onboardingMapper::toResponse);
    }

    @Override
    public OnboardingResponse update(UUID workspaceId, UUID departmentId, UUID onboardingId, UpdateOnboardingRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Onboarding onboarding = findOnboarding(workspaceId, departmentId, onboardingId);
        Employee employee = onboarding.getEmployee();

        OnboardingStatus oldStatus = onboarding.getStatus();

        if (request.getStatus() != null) {
            onboarding.setStatus(request.getStatus());
            if (request.getStatus() == OnboardingStatus.IN_PROGRESS && oldStatus == OnboardingStatus.NOT_STARTED) {
                createEventLog(employee, "ONBOARDING_IN_PROGRESS", oldStatus.name(), request.getStatus().name(),
                        "Onboarding in progress for " + employee.getFirstName() + " " + employee.getLastName());
            }
            if (request.getStatus() == OnboardingStatus.COMPLETED) {
                onboarding.setActualCompletionDate(LocalDate.now());
                createEventLog(employee, "ONBOARDING_COMPLETED", oldStatus.name(), request.getStatus().name(),
                        "Onboarding Completed for " + employee.getFirstName() + " " + employee.getLastName());
                notifyOnboarding(workspaceId, employee, Notification.NotificationType.ONBOARDING_COMPLETED,
                        "Onboarding completed", "Your onboarding has been completed. Welcome aboard!");
            }
        }
        if (request.getStartDate() != null) {
            onboarding.setStartDate(request.getStartDate());
        }
        if (request.getExpectedCompletionDate() != null) {
            onboarding.setExpectedCompletionDate(request.getExpectedCompletionDate());
        }
        if (request.getActualCompletionDate() != null) {
            onboarding.setActualCompletionDate(request.getActualCompletionDate());
        }
        if (request.getAssignedHrId() != null) {
            onboarding.setAssignedHrId(request.getAssignedHrId());
        }
        if (request.getAssignedManagerId() != null) {
            onboarding.setAssignedManagerId(request.getAssignedManagerId());
        }
        if (request.getNotes() != null) {
            onboarding.setNotes(request.getNotes());
        }

        Onboarding saved = onboardingRepository.save(onboarding);
        log.info("Onboarding {} updated for employee {} by user {}",
                onboardingId, employee.getId(), userId);

        return onboardingMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID workspaceId, UUID departmentId, UUID onboardingId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Onboarding onboarding = findOnboarding(workspaceId, departmentId, onboardingId);

        onboarding.setStatus(OnboardingStatus.CANCELLED);
        onboardingRepository.save(onboarding);

        createEventLog(onboarding.getEmployee(), "ONBOARDING_CANCELLED", null, onboardingId.toString(),
                "Onboarding cancelled for " + onboarding.getEmployee().getFirstName() + " " + onboarding.getEmployee().getLastName());

        log.info("Onboarding {} cancelled by user {}", onboardingId, userId);
    }

    @Override
    public OnboardingTaskResponse addTask(UUID workspaceId, UUID departmentId, UUID onboardingId, CreateOnboardingTaskRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Onboarding onboarding = findOnboarding(workspaceId, departmentId, onboardingId);

        if (onboarding.getStatus() == OnboardingStatus.COMPLETED || onboarding.getStatus() == OnboardingStatus.CANCELLED) {
            throw new BadRequestException("Cannot add tasks to a Completed or cancelled onboarding.");
        }

        if (onboarding.getStatus() == OnboardingStatus.NOT_STARTED) {
            onboarding.setStatus(OnboardingStatus.IN_PROGRESS);
        }

        int nextOrder = request.getTaskOrder() != null ? request.getTaskOrder()
                : (onboarding.getTasks().size() + 1);

        OnboardingTask task = OnboardingTask.builder()
                .onboarding(onboarding)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(OnboardingTaskStatus.PENDING)
                .dueDate(request.getDueDate())
                .assignedUserId(request.getAssignedUserId())
                .notes(request.getNotes())
                .taskOrder(nextOrder)
                .build();

        onboarding.getTasks().add(task);
        Onboarding saved = onboardingRepository.save(onboarding);
        OnboardingTask savedTask = saved.getTasks().get(saved.getTasks().size() - 1);

        log.info("Onboarding task added: {} to onboarding {} by user {}",
                request.getTitle(), onboardingId, userId);

        createEventLog(onboarding.getEmployee(), "ONBOARDING_TASK_ADDED", null, request.getTitle(),
                "Task added: " + request.getTitle());

        return taskMapper.toResponse(savedTask);
    }

    @Override
    public OnboardingTaskResponse updateTask(UUID workspaceId, UUID departmentId, UUID onboardingId,
                                              UUID taskId, UpdateOnboardingTaskRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Onboarding onboarding = findOnboarding(workspaceId, departmentId, onboardingId);
        OnboardingTask task = findTask(taskId, onboardingId);

        OnboardingTaskStatus oldStatus = task.getStatus();

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            if (request.getStatus() == OnboardingTaskStatus.COMPLETED && oldStatus != OnboardingTaskStatus.COMPLETED) {
                task.setCompletedDate(LocalDate.now());
                createEventLog(onboarding.getEmployee(), "ONBOARDING_TASK_COMPLETED", null, task.getTitle(),
                        "Task Completed: " + task.getTitle());
            }
        }
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getAssignedUserId() != null) {
            task.setAssignedUserId(request.getAssignedUserId());
        }
        if (request.getNotes() != null) {
            task.setNotes(request.getNotes());
        }
        if (request.getTaskOrder() != null) {
            task.setTaskOrder(request.getTaskOrder());
        }

        OnboardingTask saved = onboardingTaskRepository.save(task);
        log.info("Onboarding task {} updated by user {}", taskId, userId);

        return taskMapper.toResponse(saved);
    }

    @Override
    public OnboardingTaskResponse CompleteTask(UUID workspaceId, UUID departmentId, UUID onboardingId, UUID taskId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Onboarding onboarding = findOnboarding(workspaceId, departmentId, onboardingId);
        OnboardingTask task = findTask(taskId, onboardingId);

        task.setStatus(OnboardingTaskStatus.COMPLETED);
        task.setCompletedDate(LocalDate.now());
        OnboardingTask saved = onboardingTaskRepository.save(task);

        createEventLog(onboarding.getEmployee(), "ONBOARDING_TASK_COMPLETED", null, task.getTitle(),
                "Task Completed: " + task.getTitle());

        log.info("Onboarding task {} Completed by user {}", taskId, userId);
        return taskMapper.toResponse(saved);
    }

    @Override
    public OnboardingTaskResponse skipTask(UUID workspaceId, UUID departmentId, UUID onboardingId, UUID taskId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Onboarding onboarding = findOnboarding(workspaceId, departmentId, onboardingId);
        OnboardingTask task = findTask(taskId, onboardingId);

        task.setStatus(OnboardingTaskStatus.SKIPPED);
        task.setCompletedDate(LocalDate.now());
        OnboardingTask saved = onboardingTaskRepository.save(task);

        createEventLog(onboarding.getEmployee(), "ONBOARDING_TASK_SKIPPED", null, task.getTitle(),
                "Task skipped: " + task.getTitle());

        log.info("Onboarding task {} skipped by user {}", taskId, userId);
        return taskMapper.toResponse(saved);
    }

    @Override
    public void deleteTask(UUID workspaceId, UUID departmentId, UUID onboardingId, UUID taskId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Onboarding onboarding = findOnboarding(workspaceId, departmentId, onboardingId);
        OnboardingTask task = findTask(taskId, onboardingId);

        onboardingTaskRepository.delete(task);
        log.info("Onboarding task {} deleted by user {}", taskId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingTaskResponse> listTasks(UUID workspaceId, UUID departmentId, UUID onboardingId) {
        SecurityUtils.getCurrentUserId();
        findOnboarding(workspaceId, departmentId, onboardingId);

        return onboardingTaskRepository.findAllByOnboarding_IdOrderByTaskOrderAsc(onboardingId)
                .stream()
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OnboardingStatistics getStatistics(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        OnboardingStatistics stats = new OnboardingStatistics();

        long total = onboardingRepository.countByEmployee_Department_Id(departmentId);
        stats.setTotalOnboardings(total);

        long active = onboardingRepository.countByEmployee_Department_IdAndStatus(departmentId, OnboardingStatus.IN_PROGRESS);
        long Completed = onboardingRepository.countByEmployee_Department_IdAndStatus(departmentId, OnboardingStatus.COMPLETED);
        long cancelled = onboardingRepository.countByEmployee_Department_IdAndStatus(departmentId, OnboardingStatus.CANCELLED);
        long onHold = onboardingRepository.countByEmployee_Department_IdAndStatus(departmentId, OnboardingStatus.ON_HOLD);
        long notStarted = onboardingRepository.countByEmployee_Department_IdAndStatus(departmentId, OnboardingStatus.NOT_STARTED);

        stats.setActiveOnboardings(active);
        stats.setCompletedOnboardings(Completed);
        stats.setCancelledOnboardings(cancelled);
        stats.setOnHoldCount(onHold);
        stats.setNotStartedCount(notStarted);

        LocalDate now = LocalDate.now();
        LocalDate firstDay = now.withDayOfMonth(1);
        LocalDate firstDayNextMonth = firstDay.plusMonths(1);
        long thisMonth = onboardingRepository.countOnboardingThisMonth(departmentId, firstDay, firstDayNextMonth);
        stats.setOnboardingThisMonth(thisMonth);

        long overdue = onboardingRepository.countOverdueTasks(departmentId, now);
        stats.setOverdueTasks(overdue);

        double CompletionRate = total > 0 ? (double) Completed / total * 100 : 0;
        stats.setCompletionRate(CompletionRate);

        List<Object[]> datePairs = onboardingRepository.findCompletionDatePairs(departmentId);
        double avgDays = 0;
        if (!datePairs.isEmpty()) {
            avgDays = datePairs.stream()
                    .mapToLong(pair -> {
                        LocalDate end = (LocalDate) pair[0];
                        LocalDate start = (LocalDate) pair[1];
                        return ChronoUnit.DAYS.between(start, end);
                    })
                    .average()
                    .orElse(0);
        }
        stats.setAverageCompletionDays(avgDays);

        double avgTaskCompletion = 0;
        List<Object[]> taskGroups = onboardingRepository.findTaskCompletionGroupsByDepartmentId(departmentId);
        if (!taskGroups.isEmpty()) {
            double sum = 0, n = 0;
            for (Object[] row : taskGroups) {
                long taskTotal = (Long) row[0];
                long completed = ((Number) row[1]).longValue();
                if (taskTotal > 0) {
                    sum += (double) completed / taskTotal * 100;
                    n++;
                }
            }
            avgTaskCompletion = n > 0 ? sum / n : 0;
        }
        stats.setAverageCompletionPercentage(avgTaskCompletion);

        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : onboardingRepository.countByStatusGrouped(departmentId)) {
            byStatus.put(((OnboardingStatus) row[0]).name(), (Long) row[1]);
        }
        stats.setOnboardingsByStatus(byStatus);

        Map<String, Long> byDepartment = new HashMap<>();
        for (Object[] row : onboardingRepository.countByDepartmentAcrossWorkspace(workspaceId)) {
            byDepartment.put((String) row[0], (Long) row[1]);
        }
        stats.setOnboardingsByDepartment(byDepartment);

        return stats;
    }

    private Onboarding findOnboarding(UUID workspaceId, UUID departmentId, UUID onboardingId) {
        findActiveDepartment(workspaceId, departmentId);
        return onboardingRepository.findByIdAndEmployee_Department_Id(onboardingId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding not found."));
    }

    private OnboardingTask findTask(UUID taskId, UUID onboardingId) {
        return onboardingTaskRepository.findByIdAndOnboarding_Id(taskId, onboardingId)
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding task not found."));
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

    private void notifyOnboarding(UUID workspaceId, Employee employee, Notification.NotificationType type,
                                  String title, String body) {
        userRepository.findByEmail(employee.getEmail()).ifPresent(user -> {
            CreateNotificationRequest notifReq = new CreateNotificationRequest();
            notifReq.setRecipientId(user.getId());
            notifReq.setNotificationType(type);
            notifReq.setTitle(title);
            notifReq.setBody(body);
            notificationService.create(workspaceId, notifReq);
        });
    }
}
