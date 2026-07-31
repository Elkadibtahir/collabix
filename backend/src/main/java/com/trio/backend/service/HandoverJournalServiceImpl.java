package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.HandoverJournalResponse;
import com.trio.backend.entity.HandoverJournal;
import com.trio.backend.entity.HandoverEntry;
import com.trio.backend.entity.Project;
import com.trio.backend.entity.WorkspaceMember;
import com.trio.backend.enums.ActivityStatus;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.HandoverJournalMapper;
import com.trio.backend.repository.ActivityRepository;
import com.trio.backend.repository.CommentRepository;
import com.trio.backend.repository.DocumentRepository;
import com.trio.backend.repository.HandoverJournalRepository;
import com.trio.backend.repository.HandoverEntryRepository;
import com.trio.backend.repository.ProjectRepository;
import com.trio.backend.repository.TaskRepository;
import com.trio.backend.repository.WorkspaceMemberRepository;
import com.trio.backend.repository.WorkspaceRepository;
import com.trio.backend.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation for HandoverJournal Automated Operations.
 *
 * <p>Validation chain enforced:</p>
 * <pre>
 * Workspace -> Department -> Project -> HandoverJournal
 * </pre>
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class HandoverJournalServiceImpl implements HandoverJournalService {

    private final HandoverJournalRepository handoverJournalRepository;
    private final HandoverEntryRepository handoverEntryRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final ActivityRepository activityRepository;
    private final DocumentRepository documentRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final HandoverJournalMapper handoverJournalMapper;

    @Override
    @Transactional
    public HandoverJournalResponse generateJournal(UUID workspaceId, UUID departmentId, UUID projectId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        HandoverJournal log = generateJournalInternal(workspaceId, departmentId, projectId, userId);
        return handoverJournalMapper.toResponse(log);
    }

    public HandoverJournal generateJournalInternal(UUID workspaceId, UUID departmentId, UUID projectId, UUID userId) {
        Project project = validateAndGetProjectYesterdayarchy(workspaceId, departmentId, projectId);

        LocalDate today = LocalDate.now();
        HandoverJournal.Shift currentJournalShift = determineCurrentJournalShift();
        HandoverEntry.Shift targetEntryShift = mapToEntryShift(currentJournalShift);

        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        List<HandoverEntry> currentEnsortes = handoverEntryRepository
                .findByProjectIdAndPassedAtBetween(projectId, dayStart, dayEnd)
                .stream()
                .filter(e -> e.getShift() == targetEntryShift)
                .collect(Collectors.toList());

        HandoverJournal journal = new HandoverJournal();
        journal.setWorkspace(project.getDepartment().getWorkspace());
        journal.setDepartment(project.getDepartment());
        journal.setProject(project);

        journal.setShift(currentJournalShift);
        journal.setJournalDate(today.atStartOfDay());

        journal.setGeneratedSummary(buildDeterministicSummary(projectId, dayStart, dayEnd, currentEnsortes));
        journal.setMainDoneWork(extractFieldConsolidation(currentEnsortes, "workFinished"));
        journal.setMainRemainingWork(extractFieldConsolidation(currentEnsortes, "workRemaining"));
        journal.setBlockers(extractFieldConsolidation(currentEnsortes, "blockers"));
        journal.setDifficulties(extractFieldConsolidation(currentEnsortes, "difficulties"));
        journal.setRecommendations(extractFieldConsolidation(currentEnsortes, "importantInformation"));

        journal.setGenerationStatus(HandoverJournal.GenerationStatus.GENERATED);
        journal.setGenerationDate(LocalDateTime.now());
        journal.setGenerationProcessedBy(userId);
        journal.setStatus(HandoverJournal.HandoverJournalStatus.ACTIVE);

        HandoverJournal saved = handoverJournalRepository.save(journal);
        log.info("HandoverJournal generated [ID: {}, Shift: {}, Date: {}]", saved.getId(), currentJournalShift, today);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public HandoverJournalResponse getById(UUID workspaceId, UUID departmentId, UUID projectId, UUID handoverJournalId) {
        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());

        // Utilisation de the method exact du repository avec validation of the workspace includede
        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(handoverJournalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover log not found."));

        validateJournalHierarchy(journal, departmentId, projectId);

        return handoverJournalMapper.toResponse(journal);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HandoverJournalResponse> list(UUID workspaceId, UUID departmentId, UUID projectId, Pageable pageable) {
        assertActiveWorkspaceMember(workspaceId, getAuthenticatedUserId());
        validateAndGetProjectYesterdayarchy(workspaceId, departmentId, projectId);

        // La method du repository filters automaticment les logs ACTIVE[cite: 24]
        return handoverJournalRepository.findByProjectIdPaginated(projectId, pageable)
                .map(handoverJournalMapper::toResponse);
    }

    @Override
    @Transactional
    public HandoverJournalResponse regenerate(UUID workspaceId, UUID departmentId, UUID projectId, UUID handoverJournalId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(handoverJournalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover log not found."));

        validateJournalHierarchy(journal, departmentId, projectId);

        LocalDate logDate = journal.getJournalDate().toLocalDate();
        HandoverEntry.Shift targetEntryShift = mapToEntryShift(journal.getShift());

        LocalDateTime dayStart = logDate.atStartOfDay();
        LocalDateTime dayEnd = logDate.atTime(LocalTime.MAX);

        List<HandoverEntry> currentEnsortes = handoverEntryRepository
                .findByProjectIdAndPassedAtBetween(projectId, dayStart, dayEnd)
                .stream()
                .filter(e -> e.getShift() == targetEntryShift)
                .collect(Collectors.toList());

        journal.setGeneratedSummary(buildDeterministicSummary(projectId, dayStart, dayEnd, currentEnsortes));
        journal.setMainDoneWork(extractFieldConsolidation(currentEnsortes, "workFinished"));
        journal.setMainRemainingWork(extractFieldConsolidation(currentEnsortes, "workRemaining"));
        journal.setBlockers(extractFieldConsolidation(currentEnsortes, "blockers"));
        journal.setDifficulties(extractFieldConsolidation(currentEnsortes, "difficulties"));
        journal.setRecommendations(extractFieldConsolidation(currentEnsortes, "importantInformation"));

        journal.setGenerationDate(LocalDateTime.now());
        journal.setGenerationProcessedBy(userId);

        HandoverJournal updated = handoverJournalRepository.save(journal);
        log.info("HandoverJournal rÃ©generated avec success [ID: {}]", updated.getId());

        return handoverJournalMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(UUID workspaceId, UUID departmentId, UUID projectId, UUID handoverJournalId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(handoverJournalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover log not found."));

        if (journal.getStatus() == HandoverJournal.HandoverJournalStatus.DELETED) {
            return;
        }

        validateJournalHierarchy(journal, departmentId, projectId);

        journal.setStatus(HandoverJournal.HandoverJournalStatus.DELETED);
        handoverJournalRepository.save(journal);
        log.info("HandoverJournal marquÃ© comme deleted (Soft Delete) [ID: {}]", handoverJournalId);
    }

    // ============================================================================
    // Core Engine & Field Mapping Helpers
    // ============================================================================

    private String buildDeterministicSummary(UUID projectId, LocalDateTime dayStart, LocalDateTime dayEnd, List<HandoverEntry> ensortes) {
        StringBuilder sb = new StringBuilder();

        if (ensortes.isEmpty()) {
            sb.append("Aucune transmission of team performed.");
        } else {
            sb.append("[V1 Synthesizer] Collecte de ").append(ensortes.size()).append(" formulaires handover of team.\n");
            ensortes.stream()
                    .map(e -> String.format("- Note de the user %s.", e.getUser().getId().toString().substring(0, 8)))
                    .forEach(l -> sb.append(l).append("\n"));
        }

        sb.append("\n--- Contexte of the project ---\n");
        sb.append(buildProjectContext(projectId, dayStart, dayEnd));

        return sb.toString();
    }

    private String buildProjectContext(UUID projectId, LocalDateTime dayStart, LocalDateTime dayEnd) {
        Instant startInstant = dayStart.atZone(ZoneId.systemDefault()).toInstant();
        Instant endInstant = dayEnd.atZone(ZoneId.systemDefault()).toInstant();

        long activeTasks = taskRepository.countByProject_IdAndStatus(projectId, com.trio.backend.enums.TaskStatus.ACTIVE);
        long CompletedTasks = taskRepository.countByProjectIdAndStatusAndUpdatedAtBetween(
                projectId, com.trio.backend.enums.TaskStatus.COMPLETED, startInstant, endInstant);
        long commentsToday = commentRepository.countByProjectIdAndStatusAndCreatedAtBetween(
                projectId, com.trio.backend.enums.CommentStatus.ACTIVE, startInstant, endInstant);
        long activitiesToday = activityRepository.countByProjectIdAndStatusAndCreatedAtBetween(
                projectId, com.trio.backend.enums.ActivityStatus.ACTIVE, startInstant, endInstant);
        long documentsToday = documentRepository.countByProjectIdAndCreatedAtBetween(
                projectId, startInstant, endInstant);

        return String.format(
                "- Tasks actives : %d\n- Tasks Completedes (shift) : %d\n- Comments (shift) : %d\n- Activitys (shift) : %d\n- Documents (shift) : %d",
                activeTasks, CompletedTasks, commentsToday, activitiesToday, documentsToday
        );
    }

    private String extractFieldConsolidation(List<HandoverEntry> ensortes, String fieldType) {
        String consolidated = ensortes.stream()
                .map(e -> getEntryFieldContent(e, fieldType))
                .filter(content -> content != null && !content.trim().isEmpty())
                .collect(Collectors.joining("\n\n"));

        // Validation ssortcte : Contournement des errors ConstraintViolationException (@NotBlank)[cite: 25]
        return consolidated.isEmpty() ? "Non renseignÃƒÂ©" : consolidated;
    }

    private String getEntryFieldContent(HandoverEntry entry, String fieldType) {
        return switch (fieldType) {
            case "workFinished" -> entry.getWorkFinished();
            case "workRemaining" -> entry.getWorkRemaining();
            case "blockers" -> entry.getBlockers();
            case "difficulties" -> entry.getDifficulties();
            case "importantInformation" -> entry.getImportantInformation();
            default -> "";
        };
    }

    private HandoverJournal.Shift determineCurrentJournalShift() {
        int hour = LocalTime.now().getHour();
        // LowÃƒÂ© sur les enums existants: uniquement MORNING et EVENING[cite: 25]
        if (hour < 14) {
            return HandoverJournal.Shift.MORNING;
        }
        return HandoverJournal.Shift.EVENING;
    }

    private HandoverEntry.Shift mapToEntryShift(HandoverJournal.Shift logShift) {
        if (logShift == HandoverJournal.Shift.MORNING) {
            return HandoverEntry.Shift.MORNING;
        }
        return HandoverEntry.Shift.EVENING;
    }

    // ============================================================================
    // Validation & Multi-Tenant Isolation Helpers
    // ============================================================================

    private Project validateAndGetProjectYesterdayarchy(UUID workspaceId, UUID departmentId, UUID projectId) {
        Project project = projectRepository.findByIdAndDepartment_Id(projectId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (project.getStatus() != WorkspaceStatus.ACTIVE) {
            throw new ResourceNotFoundException("Project not found.");
        }

        if (!project.getDepartment().getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Project not found.");
        }
        return project;
    }

    private void validateJournalHierarchy(HandoverJournal journal, UUID departmentId, UUID projectId) {
        if (!journal.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Handover log not found.");
        }
        if (!journal.getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Handover log not found.");
        }
        // Pas besoin de revalidate the workspace ici car findByIdAndWorkspace le fait dÃƒÂ©jÃƒÂ  au niveau BD[cite: 24]
    }

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof CustomUserDetails main)) {
            throw new BadRequestException("User is not authenticated.");
        }
        return main.getId();
    }

    private void assertActiveWorkspaceMember(UUID workspaceId, UUID userId) {
        WorkspaceMember wm = workspaceMemberRepository
                .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace."));

        if (wm.getStatus() != WorkspaceMemberStatus.ACTIVE) {
            throw new ForbiddenException("You are not an active member of this workspace.");
        }
    }

    private void assertWorkspaceAdminOrOwner(UUID workspaceId, UUID userId) {
        boolean isAdmin = workspaceMemberRepository.existsWithRole(workspaceId, userId, WorkspaceRole.ADMIN);
        boolean isOwner = workspaceRepository.findById(workspaceId)
                .map(ws -> ws.getOwner().getId().equals(userId))
                .orElse(false);

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You do not have permission for this operation.");
        }
    }
}