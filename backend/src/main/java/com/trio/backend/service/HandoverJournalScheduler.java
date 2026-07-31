package com.trio.backend.service;

import com.trio.backend.entity.HandoverJournal;
import com.trio.backend.entity.Project;
import com.trio.backend.entity.Workspace;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.repository.HandoverJournalRepository;
import com.trio.backend.repository.ProjectRepository;
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
public class HandoverJournalScheduler {

    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final HandoverJournalRepository handoverJournalRepository;
    private final HandoverJournalServiceImpl handoverJournalService;

    @Scheduled(cron = "0 0 14,22 * * *")
    public void autoGenerateJournals() {
        LocalTime now = LocalTime.now();
        HandoverJournal.Shift shift = (now.getHour() < 18) ? HandoverJournal.Shift.MORNING : HandoverJournal.Shift.EVENING;

        log.info("Auto-generating HandoverJournals for {} shift", shift);

        List<Workspace> activeWorkspaces = workspaceRepository.findAllActive();
        for (Workspace workspace : activeWorkspaces) {
            UUID wsId = workspace.getId();
            List<Project> activeProjects = projectRepository.findAllByWorkspaceIdAndStatus(wsId, WorkspaceStatus.ACTIVE);

            for (Project project : activeProjects) {
                try {
                    UUID projectId = project.getId();
                    UUID deptId = project.getDepartment().getId();

                    if (logExistsForShift(projectId, shift)) {
                        continue;
                    }

                    handoverJournalService.generateJournalInternal(wsId, deptId, projectId, null);
                    log.debug("Auto-generated log for project {} ({})", projectId, project.getName());
                } catch (Exception e) {
                    log.warn("Failed to auto-generate log for project {}: {}", project.getId(), e.getMessage());
                }
            }
        }

        log.info("Auto-generation of HandoverJournals for {} shift Completed", shift);
    }

    private boolean logExistsForShift(UUID projectId, HandoverJournal.Shift shift) {
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        return handoverJournalRepository.existsByProjectIdAndShiftAndJournalDateBetween(projectId, shift, dayStart, dayEnd);
    }
}
