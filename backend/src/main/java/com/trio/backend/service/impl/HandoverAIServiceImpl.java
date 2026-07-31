package com.trio.backend.service.impl;

import com.trio.backend.ai.dto.request.AIExecutionRequest;
import com.trio.backend.ai.dto.response.AIExecutionResponse;
import com.trio.backend.ai.enums.AITask;
import com.trio.backend.ai.service.AIOrchestratorService;
import com.trio.backend.dto.ai.HandoverAIEditRequest;
import com.trio.backend.dto.ai.HandoverAIResponse;
import com.trio.backend.entity.*;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.HandoverJournalMapper;
import com.trio.backend.repository.*;
import com.trio.backend.security.user.CustomUserDetails;
import com.trio.backend.service.HandoverAIService;
import com.trio.backend.service.HandoverDataCollector;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class HandoverAIServiceImpl implements HandoverAIService {

    private final HandoverDataCollector handoverDataCollector;
    private final AIOrchestratorService orchestratorService;
    private final HandoverJournalRepository handoverJournalRepository;
    private final HandoverEntryRepository handoverEntryRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final HandoverJournalMapper handoverJournalMapper;

    @Override
    public HandoverAIResponse generate(UUID workspaceId, UUID departmentId, UUID projectId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        Map<String, Object> collectedData = handoverDataCollector.collect(workspaceId, departmentId, projectId);

        Integer totalEntries = (Integer) collectedData.get("totalEntries");
        if (totalEntries == null || totalEntries == 0) {
            throw new BadRequestException("No handover entries found for this project. Cannot generate AI journal.");
        }

        AIExecutionRequest executionRequest = new AIExecutionRequest();
        executionRequest.setTask(AITask.HANDOVER_EXECUTIVE_REPORT);
        executionRequest.setInput("Generate handover journal for project: " + collectedData.get("projectName"));
        executionRequest.setWorkspaceId(workspaceId);
        executionRequest.setDepartmentId(departmentId);
        executionRequest.setProjectId(projectId);
        executionRequest.setUserId(userId);
        executionRequest.setContext(collectedData);

        long start = System.currentTimeMillis();
        AIExecutionResponse aiResponse = orchestratorService.execute(executionRequest);
        long executionTime = System.currentTimeMillis() - start;

        return saveJournal(workspaceId, departmentId, projectId, userId, aiResponse, executionTime);
    }

    @Override
    public HandoverAIResponse regenerate(UUID workspaceId, UUID departmentId, UUID projectId, UUID journalId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(journalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover journal not found"));

        return generate(workspaceId, departmentId, projectId);
    }

    @Override
    public HandoverAIResponse edit(UUID workspaceId, UUID departmentId, UUID projectId, UUID journalId,
                                    HandoverAIEditRequest request) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(journalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover journal not found"));

        if (request.getExecutiveSummary() != null) journal.setGeneratedSummary(request.getExecutiveSummary());
        if (request.getCompletedWork() != null) journal.setMainDoneWork(request.getCompletedWork());
        if (request.getPendingWork() != null) journal.setMainRemainingWork(request.getPendingWork());
        if (request.getBlockedTasks() != null) journal.setBlockers(request.getBlockedTasks());
        if (request.getCriticalRisks() != null) journal.setDifficulties(request.getCriticalRisks());
        if (request.getRecommendations() != null) journal.setRecommendations(request.getRecommendations());

        HandoverJournal saved = handoverJournalRepository.save(journal);
        return toResponse(saved, System.currentTimeMillis());
    }

    @Override
    public HandoverAIResponse approve(UUID workspaceId, UUID departmentId, UUID projectId, UUID journalId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(journalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover journal not found"));

        journal.setGenerationStatus(HandoverJournal.GenerationStatus.GENERATED);
        HandoverJournal saved = handoverJournalRepository.save(journal);
        return toResponse(saved, System.currentTimeMillis());
    }

    @Override
    public HandoverAIResponse reject(UUID workspaceId, UUID departmentId, UUID projectId, UUID journalId) {
        UUID userId = getAuthenticatedUserId();
        assertActiveWorkspaceMember(workspaceId, userId);
        assertWorkspaceAdminOrOwner(workspaceId, userId);

        HandoverJournal journal = handoverJournalRepository.findByIdAndWorkspace(journalId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Handover journal not found"));

        journal.setGenerationStatus(HandoverJournal.GenerationStatus.FAILED);
        HandoverJournal saved = handoverJournalRepository.save(journal);
        return toResponse(saved, System.currentTimeMillis());
    }

    private HandoverAIResponse saveJournal(UUID workspaceId, UUID departmentId, UUID projectId,
                                            UUID userId, AIExecutionResponse aiResponse, long executionTime) {
        Project project = projectRepository.findByIdAndDepartment_Id(projectId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        HandoverJournal journal = new HandoverJournal();
        journal.setWorkspace(project.getDepartment().getWorkspace());
        journal.setDepartment(project.getDepartment());
        journal.setProject(project);
        journal.setShift(determineCurrentShift());
        journal.setJournalDate(LocalDate.now().atStartOfDay());
        journal.setGeneratedSummary(aiResponse.getResponse());
        journal.setMainDoneWork(aiResponse.getResponse());
        journal.setMainRemainingWork(aiResponse.getResponse());
        journal.setBlockers(aiResponse.getResponse());
        journal.setDifficulties(aiResponse.getResponse());
        journal.setRecommendations(aiResponse.getResponse());
        journal.setGenerationStatus(HandoverJournal.GenerationStatus.GENERATED);
        journal.setGenerationDate(LocalDateTime.now());
        journal.setGenerationProcessedBy(userId);

        HandoverJournal saved = handoverJournalRepository.save(journal);
        log.info("AI HandoverJournal generated [ID: {}, Project: {}, ExecutionTime: {}ms]",
                saved.getId(), projectId, executionTime);

        return toResponse(saved, executionTime);
    }

    private HandoverAIResponse toResponse(HandoverJournal journal, long executionTime) {
        return HandoverAIResponse.builder()
                .journalId(journal.getId())
                .workspaceId(journal.getWorkspace().getId())
                .departmentId(journal.getDepartment().getId())
                .projectId(journal.getProject().getId())
                .shift(journal.getShift())
                .journalDate(journal.getJournalDate())
                .executiveSummary(journal.getGeneratedSummary())
                .completedWork(journal.getMainDoneWork())
                .pendingWork(journal.getMainRemainingWork())
                .criticalRisks(journal.getDifficulties())
                .blockedTasks(journal.getBlockers())
                .recommendations(journal.getRecommendations())
                .generationStatus(journal.getGenerationStatus())
                .generationDate(journal.getGenerationDate())
                .generatedBy(journal.getGenerationProcessedBy())
                .executionTime(executionTime)
                .createdAt(journal.getCreatedAt())
                .updatedAt(journal.getUpdatedAt())
                .build();
    }

    private HandoverJournal.Shift determineCurrentShift() {
        int hour = LocalDateTime.now().getHour();
        return hour < 14 ? HandoverJournal.Shift.MORNING : HandoverJournal.Shift.EVENING;
    }

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails user)) {
            throw new BadRequestException("User is not authenticated.");
        }
        return user.getId();
    }

    private void assertActiveWorkspaceMember(UUID workspaceId, UUID userId) {
        WorkspaceMember wm = workspaceMemberRepository
                .findByWorkspaceMemberId_WorkspaceIdAndWorkspaceMemberId_UserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace."));
        if (wm.getStatus() != com.trio.backend.enums.WorkspaceMemberStatus.ACTIVE) {
            throw new ForbiddenException("You are not an active member of this workspace.");
        }
    }

    private void assertWorkspaceAdminOrOwner(UUID workspaceId, UUID userId) {
        boolean isAdmin = workspaceMemberRepository.existsWithRole(
                workspaceId, userId, com.trio.backend.enums.WorkspaceRole.ADMIN);
        boolean isOwner = workspaceRepository.findById(workspaceId)
                .map(ws -> ws.getOwner().getId().equals(userId))
                .orElse(false);
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You do not have permission for this operation.");
        }
    }
}
