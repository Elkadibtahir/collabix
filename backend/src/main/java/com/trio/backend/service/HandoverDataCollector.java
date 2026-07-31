package com.trio.backend.service;

import com.trio.backend.entity.*;
import com.trio.backend.enums.CommentStatus;
import com.trio.backend.enums.TaskStatus;
import com.trio.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HandoverDataCollector {

    private final HandoverEntryRepository handoverEntryRepository;
    private final HandoverJournalRepository handoverJournalRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final ProjectRepository projectRepository;

    public Map<String, Object> collect(UUID workspaceId, UUID departmentId, UUID projectId) {
        Project project = projectRepository.findByIdAndDepartment_Id(projectId, departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        List<HandoverEntry> currentEntries = handoverEntryRepository
                .findByProjectIdAndPassedAtBetween(projectId, dayStart, dayEnd);

        List<HandoverEntry> entriesMorning = filterByShift(currentEntries, HandoverEntry.Shift.MORNING);
        List<HandoverEntry> entriesEvening = filterByShift(currentEntries, HandoverEntry.Shift.EVENING);

        List<Task> pendingTasks = taskRepository.findAllByProject_IdAndStatus(projectId, TaskStatus.ACTIVE);
        List<Task> completedTasks = taskRepository.findAllByProject_IdAndStatus(projectId, TaskStatus.COMPLETED);

        Instant dayStartInstant = dayStart.atZone(ZoneId.systemDefault()).toInstant();

        List<Comment> recentComments = commentRepository.findAllByProjectIdAndStatus(projectId, CommentStatus.ACTIVE)
                .stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(dayStartInstant))
                .toList();

        Optional<HandoverJournal> previousJournal = handoverJournalRepository
                .findByProjectIdAndShiftAndJournalDateBetween(projectId, today.minusDays(1));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("projectName", project.getName());
        data.put("projectDescription", project.getDescription());
        data.put("workspaceId", workspaceId);
        data.put("departmentId", departmentId);
        data.put("projectId", projectId);
        data.put("reportDate", today.toString());

        data.put("entriesMorning", formatEntries(entriesMorning));
        data.put("entriesEvening", formatEntries(entriesEvening));
        data.put("totalEntries", currentEntries.size());

        data.put("pendingTasks", formatTasks(pendingTasks));
        data.put("completedTasks", formatTasks(completedTasks));
        data.put("pendingTaskCount", pendingTasks.size());
        data.put("completedTaskCount", completedTasks.size());

        data.put("recentComments", formatComments(recentComments));
        data.put("recentCommentCount", recentComments.size());

        previousJournal.ifPresent(journal -> data.put("previousJournal", formatPreviousJournal(journal)));

        return data;
    }

    private List<HandoverEntry> filterByShift(List<HandoverEntry> entries, HandoverEntry.Shift shift) {
        return entries.stream()
                .filter(e -> e.getShift() == shift)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> formatEntries(List<HandoverEntry> entries) {
        return entries.stream().map(e -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("authorName", e.getUser().getFirstName() + " " + e.getUser().getLastName());
            map.put("authorId", e.getUser().getId());
            map.put("workFinished", e.getWorkFinished());
            map.put("workRemaining", e.getWorkRemaining());
            map.put("difficulties", e.getDifficulties());
            map.put("blockers", e.getBlockers());
            map.put("importantInformation", e.getImportantInformation());
            map.put("priorities", e.getPriorities());
            map.put("timeSpentMinutes", e.getTimeSpentMinutes());
            map.put("needHelp", e.getNeedHelp());
            map.put("additionalNotes", e.getAdditionalNotes());
            map.put("passedAt", e.getPassedAt() != null ? e.getPassedAt().toString() : null);
            return map;
        }).toList();
    }

    private List<Map<String, Object>> formatTasks(List<Task> tasks) {
        return tasks.stream().map(t -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("title", t.getTitle());
            map.put("description", t.getDescription());
            map.put("status", t.getStatus());
            map.put("storyPoints", t.getStoryPoints());
            map.put("dueAt", t.getDueAt() != null ? t.getDueAt().toString() : null);
            return map;
        }).toList();
    }

    private List<Map<String, Object>> formatComments(List<Comment> comments) {
        return comments.stream().map(c -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("content", c.getContent());
            map.put("authorId", c.getCreatedBy());
            map.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
            return map;
        }).toList();
    }

    private Map<String, Object> formatPreviousJournal(HandoverJournal journal) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", journal.getId());
        map.put("summary", journal.getGeneratedSummary());
        map.put("generatedAt", journal.getGenerationDate() != null ? journal.getGenerationDate().toString() : null);
        return map;
    }
}
