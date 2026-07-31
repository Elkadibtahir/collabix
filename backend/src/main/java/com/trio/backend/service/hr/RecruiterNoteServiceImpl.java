package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.CreateRecruiterNoteRequest;
import com.trio.backend.dto.hr.RecruiterNoteResponse;
import com.trio.backend.dto.hr.RecruiterNoteSearchCriteria;
import com.trio.backend.dto.hr.RecruiterNoteStatistics;
import com.trio.backend.dto.hr.UpdateRecruiterNoteRequest;
import com.trio.backend.entity.Candidate;
import com.trio.backend.entity.RecruiterNote;
import com.trio.backend.enums.NoteCategory;
import com.trio.backend.enums.NotePriority;
import com.trio.backend.enums.NoteVisibility;
import com.trio.backend.enums.WorkspaceStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.RecruiterNoteMapper;
import com.trio.backend.repository.CandidateRepository;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.RecruiterNoteRepository;
import com.trio.backend.repository.RecruiterNoteSpecification;
import com.trio.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RecruiterNoteServiceImpl implements RecruiterNoteService {

    private final RecruiterNoteRepository noteRepository;
    private final CandidateRepository candidateRepository;
    private final DepartmentRepository departmentRepository;
    private final RecruiterNoteMapper noteMapper;

    @Override
    public RecruiterNoteResponse create(UUID workspaceId, UUID departmentId, CreateRecruiterNoteRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Candidate candidate = findActiveCandidate(workspaceId, departmentId, request.getCandidateId());

        RecruiterNote note = RecruiterNote.builder()
                .candidate(candidate)
                .title(request.getTitle())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : NotePriority.MEDIUM)
                .content(request.getContent())
                .visibility(request.getVisibility())
                .build();

        RecruiterNote saved = noteRepository.save(note);
        log.info("Recruiter note created: {} for candidate {} by user {}", saved.getTitle(), saved.getCandidate().getId(), userId);
        return noteMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RecruiterNoteResponse getById(UUID workspaceId, UUID departmentId, UUID candidateId, UUID noteId) {
        SecurityUtils.getCurrentUserId();
        RecruiterNote note = findActiveNote(workspaceId, departmentId, candidateId, noteId);
        return noteMapper.toResponse(note);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RecruiterNoteResponse> listByCandidate(UUID workspaceId, UUID departmentId, UUID candidateId, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveCandidate(workspaceId, departmentId, candidateId);
        return noteRepository.findAllByCandidate_IdOrderByCreatedAtDesc(candidateId, pageable)
                .map(noteMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RecruiterNoteResponse> search(UUID workspaceId, UUID departmentId, RecruiterNoteSearchCriteria criteria, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);
        return noteRepository.findAll(
                        RecruiterNoteSpecification.withFilter(departmentId, criteria), pageable)
                .map(noteMapper::toResponse);
    }

    @Override
    public RecruiterNoteResponse update(UUID workspaceId, UUID departmentId, UUID candidateId, UUID noteId, UpdateRecruiterNoteRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        RecruiterNote note = findActiveNote(workspaceId, departmentId, candidateId, noteId);

        if (!note.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("You can only edit your own notes.");
        }

        if (request.getTitle() != null) {
            note.setTitle(request.getTitle());
        }
        if (request.getCategory() != null) {
            note.setCategory(request.getCategory());
        }
        if (request.getPriority() != null) {
            note.setPriority(request.getPriority());
        }
        if (request.getContent() != null) {
            note.setContent(request.getContent());
        }
        if (request.getVisibility() != null) {
            note.setVisibility(request.getVisibility());
        }

        RecruiterNote saved = noteRepository.save(note);
        log.info("Recruiter note updated: {} by user {}", noteId, userId);
        return noteMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID workspaceId, UUID departmentId, UUID candidateId, UUID noteId) {
        UUID userId = SecurityUtils.getCurrentUserId();

        RecruiterNote note = findActiveNote(workspaceId, departmentId, candidateId, noteId);

        if (!note.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("You can only delete your own notes.");
        }

        noteRepository.delete(note);
        log.info("Recruiter note deleted: {} by user {}", noteId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public RecruiterNoteStatistics getStatistics(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        Instant startOfToday = LocalDate.now(ZoneId.systemDefault()).atStartOfDay(ZoneId.systemDefault()).toInstant();
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        Instant startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .atStartOfDay(ZoneId.systemDefault()).toInstant();

        RecruiterNoteStatistics stats = new RecruiterNoteStatistics();
        stats.setTotalNotes(noteRepository.countByDepartmentId(departmentId));
        stats.setNotesToday(noteRepository.countByDepartmentIdAndCreatedAtAfter(departmentId, startOfToday));
        stats.setNotesThisWeek(noteRepository.countByDepartmentIdAndCreatedAtAfter(departmentId, startOfWeek));

        Map<NoteCategory, Long> byCategory = new EnumMap<>(NoteCategory.class);
        for (Object[] row : noteRepository.countByCategoryGrouped(departmentId)) {
            byCategory.put((NoteCategory) row[0], (Long) row[1]);
        }
        stats.setNotesByCategory(byCategory);

        Map<NotePriority, Long> byPriority = new EnumMap<>(NotePriority.class);
        for (Object[] row : noteRepository.countByPriorityGrouped(departmentId)) {
            byPriority.put((NotePriority) row[0], (Long) row[1]);
        }
        stats.setNotesByPriority(byPriority);

        return stats;
    }

    private RecruiterNote findActiveNote(UUID workspaceId, UUID departmentId, UUID candidateId, UUID noteId) {
        findActiveCandidate(workspaceId, departmentId, candidateId);

        RecruiterNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found."));
        if (!note.getCandidate().getId().equals(candidateId)) {
            throw new ResourceNotFoundException("Note not found.");
        }
        return note;
    }

    private Candidate findActiveCandidate(UUID workspaceId, UUID departmentId, UUID candidateId) {
        findActiveDepartment(workspaceId, departmentId);

        Candidate candidate = candidateRepository.findByIdAndDepartmentId(candidateId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found."));
        if (candidate.isArchived()) {
            throw new ResourceNotFoundException("Candidate not found.");
        }
        return candidate;
    }

    private void findActiveDepartment(UUID workspaceId, UUID departmentId) {
        departmentRepository.findByIdAndWorkspace_Id(departmentId, workspaceId)
                .filter(dept -> dept.getStatus() == WorkspaceStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
    }
}
