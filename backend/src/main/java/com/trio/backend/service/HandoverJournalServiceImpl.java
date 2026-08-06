package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.HandoverJournalResponse;
import com.trio.backend.entity.HandoverEntry;
import com.trio.backend.entity.HandoverEntry.HandoverStatus;
import com.trio.backend.entity.HandoverJournal;
import com.trio.backend.entity.Project;
import com.trio.backend.enums.CommentStatus;
import com.trio.backend.enums.TaskStatus;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.HandoverJournalMapper;
import com.trio.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
 * Implementation for HandoverJournal generation, aggregating the workflow-based
 * HandoverEntry records by day per project.
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
    private final HandoverJournalMapper handoverJournalMapper;
    private final HandoverSupport support;

    @Override
    @Transactional
    public HandoverJournalResponse generateJournal(UUID workspaceId, UUID departmentId, UUID projectId) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);
        if (!support.isWorkspaceAdminOrOwner(workspaceId, userId)) {
            throw new com.trio.backend.exception.ForbiddenException("You do not have permission for this operation.");
        }

        HandoverJournal log = generateJournalInternal(workspaceId, departmentId, projectId, userId);
        return handoverJournalMapper.toResponse(log);
    }

    public HandoverJournal generateJournalInternal(UUID workspaceId, UUID departmentId, UUID projectId, UUID userId) {
        Project project = validateAndGetProject(workspaceId, departmentId, projectId);

        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);
        Instant startInstant = dayStart.atZone(ZoneId.systemDefault()).toInstant();
        Instant endInstant = dayEnd.atZone(ZoneId.systemDefault()).toInstant();

        List<HandoverEntry> entries = handoverEntryRepository
                .findByProjectIdAndCreatedAtBetween(projectId, startInstant, endInstant);

        HandoverJournal journal = new HandoverJournal();
        journal.setWorkspace(project.getDepartment().getWorkspace());
        journal.setDepartment(project.getDepartment());
        journal.setProject(project);
        journal.setJournalDate(today.atStartOfDay());

        journal.setTotalHandovers((long) entries.size());
        journal.setPendingHandovers(countByStatus(entries, HandoverStatus.PENDING));
        journal.setCompletedHandovers(countByStatus(entries, HandoverStatus.COMPLETED));
        journal.setRejectedHandovers(countByStatus(entries, HandoverStatus.REJECTED));
        journal.setUrgentHandovers(entries.stream().filter(e -> e.getPriority() == HandoverEntry.Priority.URGENT).count());
        journal.setOverdueHandovers(entries.stream().filter(HandoverJournalServiceImpl::isOverdue).count());

        journal.setGeneratedSummary(buildDeterministicSummary(project, dayStart, dayEnd, entries));
        journal.setMainDoneWork(extractFieldConsolidation(entries, "completed"));
        journal.setMainRemainingWork(extractFieldConsolidation(entries, "pending"));
        journal.setBlockers(extractFieldConsolidation(entries, "overdue"));
        journal.setDifficulties(extractFieldConsolidation(entries, "urgent"));
        journal.setRecommendations(extractFieldConsolidation(entries, "rejected"));

        journal.setGenerationStatus(HandoverJournal.GenerationStatus.GENERATED);
        journal.setGenerationDate(LocalDateTime.now());
        journal.setGenerationProcessedBy(userId);
        journal.setStatus(HandoverJournal.HandoverJournalStatus.ACTIVE);

        HandoverJournal saved = handoverJournalRepository.save(journal);
        log.info("HandoverJournal generated [ID: {}, Date: {}]", saved.getId(), today);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public HandoverJournalResponse getById(UUID workspaceId, UUID departmentId, UUID projectId, UUID handoverJournalId) {
        support.assertActiveWorkspaceMember(workspaceId, support.currentUserId());

        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(handoverJournalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover log not found."));

        validateJournalHierarchy(journal, departmentId, projectId);
        return handoverJournalMapper.toResponse(journal);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HandoverJournalResponse> list(UUID workspaceId, UUID departmentId, UUID projectId, Pageable pageable) {
        support.assertActiveWorkspaceMember(workspaceId, support.currentUserId());
        validateAndGetProject(workspaceId, departmentId, projectId);

        return handoverJournalRepository.findByProjectIdPaginated(projectId, pageable)
                .map(handoverJournalMapper::toResponse);
    }

    @Override
    @Transactional
    public HandoverJournalResponse regenerate(UUID workspaceId, UUID departmentId, UUID projectId, UUID handoverJournalId) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);
        if (!support.isWorkspaceAdminOrOwner(workspaceId, userId)) {
            throw new com.trio.backend.exception.ForbiddenException("You do not have permission for this operation.");
        }

        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(handoverJournalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover log not found."));

        validateJournalHierarchy(journal, departmentId, projectId);

        LocalDate logDate = journal.getJournalDate().toLocalDate();
        LocalDateTime dayStart = logDate.atStartOfDay();
        LocalDateTime dayEnd = logDate.atTime(LocalTime.MAX);
        Instant startInstant = dayStart.atZone(ZoneId.systemDefault()).toInstant();
        Instant endInstant = dayEnd.atZone(ZoneId.systemDefault()).toInstant();

        List<HandoverEntry> entries = handoverEntryRepository
                .findByProjectIdAndCreatedAtBetween(projectId, startInstant, endInstant);

        journal.setTotalHandovers((long) entries.size());
        journal.setPendingHandovers(countByStatus(entries, HandoverStatus.PENDING));
        journal.setCompletedHandovers(countByStatus(entries, HandoverStatus.COMPLETED));
        journal.setRejectedHandovers(countByStatus(entries, HandoverStatus.REJECTED));
        journal.setUrgentHandovers(entries.stream().filter(e -> e.getPriority() == HandoverEntry.Priority.URGENT).count());
        journal.setOverdueHandovers(entries.stream().filter(HandoverJournalServiceImpl::isOverdue).count());

        journal.setGeneratedSummary(buildDeterministicSummary(projectRepository
                        .findByIdAndDepartment_Id(projectId, departmentId).orElse(null), dayStart, dayEnd, entries));
        journal.setMainDoneWork(extractFieldConsolidation(entries, "completed"));
        journal.setMainRemainingWork(extractFieldConsolidation(entries, "pending"));
        journal.setBlockers(extractFieldConsolidation(entries, "overdue"));
        journal.setDifficulties(extractFieldConsolidation(entries, "urgent"));
        journal.setRecommendations(extractFieldConsolidation(entries, "rejected"));

        journal.setGenerationDate(LocalDateTime.now());
        journal.setGenerationProcessedBy(userId);

        HandoverJournal updated = handoverJournalRepository.save(journal);
        log.info("HandoverJournal regenerated [ID: {}]", updated.getId());
        return handoverJournalMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(UUID workspaceId, UUID departmentId, UUID projectId, UUID handoverJournalId) {
        UUID userId = support.currentUserId();
        support.assertActiveWorkspaceMember(workspaceId, userId);
        if (!support.isWorkspaceAdminOrOwner(workspaceId, userId)) {
            throw new com.trio.backend.exception.ForbiddenException("You do not have permission for this operation.");
        }

        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(handoverJournalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover log not found."));

        if (journal.getStatus() == HandoverJournal.HandoverJournalStatus.DELETED) {
            return;
        }

        validateJournalHierarchy(journal, departmentId, projectId);

        journal.setStatus(HandoverJournal.HandoverJournalStatus.DELETED);
        handoverJournalRepository.save(journal);
        log.info("HandoverJournal marked as deleted (Soft Delete) [ID: {}]", handoverJournalId);
    }

    // ============================================================================
    // Aggregation helpers
    // ============================================================================

    private static boolean isOverdue(HandoverEntry e) {
        if (e.getDueDate() == null) {
            return false;
        }
        boolean open = e.getStatus() == HandoverStatus.PENDING || e.getStatus() == HandoverStatus.DRAFT;
        return open && e.getDueDate().isBefore(LocalDateTime.now());
    }

    private long countByStatus(List<HandoverEntry> entries, HandoverStatus status) {
        return entries.stream().filter(e -> e.getStatus() == status).count();
    }

    private String buildDeterministicSummary(Project project, LocalDateTime dayStart, LocalDateTime dayEnd,
                                             List<HandoverEntry> entries) {
        StringBuilder sb = new StringBuilder();

        if (entries.isEmpty()) {
            sb.append("No handovers recorded for this project on this day.");
        } else {
            sb.append("[V1 Synthesizer] Collected ").append(entries.size())
                    .append(" handover(s) for the day.\n");
            entries.stream()
                    .map(e -> String.format("- [%s] %s (from %s to %s)",
                            e.getStatus(), e.getTitle(),
                            support.userDisplayName(e.getSender()),
                            support.userDisplayName(e.getReceiver())))
                    .forEach(l -> sb.append(l).append("\n"));
        }

        sb.append("\n--- Project context ---\n");
        if (project != null) {
            sb.append(buildProjectContext(project, dayStart, dayEnd));
        }

        return sb.toString();
    }

    private String buildProjectContext(Project project, LocalDateTime dayStart, LocalDateTime dayEnd) {
        Instant startInstant = dayStart.atZone(ZoneId.systemDefault()).toInstant();
        Instant endInstant = dayEnd.atZone(ZoneId.systemDefault()).toInstant();
        UUID projectId = project.getId();

        long activeTasks = taskRepository.countActiveByProjectId(projectId);
        long completedTasks = taskRepository.countByProjectIdAndStatusAndUpdatedAtBetween(
                projectId, TaskStatus.COMPLETED, startInstant, endInstant);
        long commentsToday = commentRepository.countByProjectIdAndStatusAndCreatedAtBetween(
                projectId, CommentStatus.ACTIVE, startInstant, endInstant);
        long activitiesToday = activityRepository.countByProjectIdAndStatusAndCreatedAtBetween(
                projectId, com.trio.backend.enums.ActivityStatus.ACTIVE, startInstant, endInstant);
        long documentsToday = documentRepository.countByProjectIdAndCreatedAtBetween(
                projectId, startInstant, endInstant);

        return String.format(
                "- Active tasks: %d\n- Tasks completed (today): %d\n- Comments (today): %d\n- Activities (today): %d\n- Documents (today): %d",
                activeTasks, completedTasks, commentsToday, activitiesToday, documentsToday
        );
    }

    private String extractFieldConsolidation(List<HandoverEntry> entries, String fieldType) {
        String consolidated = entries.stream()
                .filter(e -> switch (fieldType) {
                    case "completed" -> e.getStatus() == HandoverStatus.COMPLETED;
                    case "pending" -> e.getStatus() == HandoverStatus.PENDING;
                    case "rejected" -> e.getStatus() == HandoverStatus.REJECTED;
                    case "urgent" -> e.getPriority() == HandoverEntry.Priority.URGENT;
                    case "overdue" -> isOverdue(e);
                    default -> false;
                })
                .map(e -> String.format("- %s (%s): %s", e.getTitle(),
                        support.userDisplayName(e.getSender()), e.getContent()))
                .filter(content -> !content.isBlank())
                .collect(Collectors.joining("\n\n"));

        return consolidated.isEmpty() ? "Non renseigne" : consolidated;
    }

    // ============================================================================
    // Validation & Multi-Tenant Isolation Helpers
    // ============================================================================

    private Project validateAndGetProject(UUID workspaceId, UUID departmentId, UUID projectId) {
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
    }
}
