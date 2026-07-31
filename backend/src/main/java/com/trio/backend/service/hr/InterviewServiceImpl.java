package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.AddParticipantRequest;
import com.trio.backend.dto.hr.CreateInterviewRequest;
import com.trio.backend.dto.hr.InterviewFeedbackRequest;
import com.trio.backend.dto.hr.InterviewFeedbackResponse;
import com.trio.backend.dto.hr.InterviewParticipantResponse;
import com.trio.backend.dto.hr.InterviewResponse;
import com.trio.backend.dto.hr.InterviewStatistics;
import com.trio.backend.dto.hr.UpdateInterviewRequest;
import com.trio.backend.entity.Candidate;
import com.trio.backend.entity.CandidateStatusHistory;
import com.trio.backend.entity.Interview;
import com.trio.backend.entity.InterviewFeedback;
import com.trio.backend.entity.InterviewParticipant;
import com.trio.backend.enums.CandidateStatus;
import com.trio.backend.enums.InterviewStatus;
import com.trio.backend.enums.InterviewType;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ConflictException;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.InterviewMapper;
import com.trio.backend.repository.CandidateRepository;
import com.trio.backend.repository.CandidateStatusHistoryRepository;
import com.trio.backend.repository.DepartmentRepository;
import com.trio.backend.repository.InterviewFeedbackRepository;
import com.trio.backend.repository.InterviewParticipantRepository;
import com.trio.backend.repository.InterviewRepository;
import com.trio.backend.repository.UserRepository;
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
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class InterviewServiceImpl implements InterviewService {

    private static final Map<InterviewType, CandidateStatus> INTERVIEW_TO_CANDIDATE_STATUS = new EnumMap<>(InterviewType.class);

    static {
        INTERVIEW_TO_CANDIDATE_STATUS.put(InterviewType.HR, CandidateStatus.HR_INTERVIEW);
        INTERVIEW_TO_CANDIDATE_STATUS.put(InterviewType.TECHNICAL, CandidateStatus.TECHNICAL_INTERVIEW);
        INTERVIEW_TO_CANDIDATE_STATUS.put(InterviewType.FINAL, CandidateStatus.FINAL_INTERVIEW);
    }

    private static final Set<CandidateStatus> TERMINAL_STATUSES = EnumSet.of(
            CandidateStatus.HIRED, CandidateStatus.REJECTED, CandidateStatus.WITHDRAWN
    );

    private static final List<InterviewStatus> ACTIVE_INTERVIEW_STATUSES = List.of(
            InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED
    );

    private final InterviewRepository interviewRepository;
    private final InterviewParticipantRepository participantRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final CandidateRepository candidateRepository;
    private final CandidateStatusHistoryRepository candidateStatusHistoryRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final InterviewMapper interviewMapper;

    @Override
    public InterviewResponse schedule(UUID workspaceId, UUID departmentId, UUID candidateId, CreateInterviewRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Candidate candidate = findActiveCandidate(workspaceId, departmentId, candidateId);

        if (TERMINAL_STATUSES.contains(candidate.getCurrentStatus())) {
            throw new BadRequestException("Cannot schedule interview for candidate in terminal status: " + candidate.getCurrentStatus());
        }

        validateInterviewTiming(request.getStartTime(), request.getEndTime(), false);

        boolean hasActive = interviewRepository.existsByCandidate_IdAndTypeAndStatusIn(
                candidateId, request.getType(), ACTIVE_INTERVIEW_STATUSES);
        if (hasActive) {
            throw new ConflictException("Candidate already has an active " + request.getType() + " interview.");
        }

        Interview interview = Interview.builder()
                .candidate(candidate)
                .type(request.getType())
                .status(InterviewStatus.SCHEDULED)
                .title(request.getTitle() != null ? request.getTitle() : request.getType().name())
                .description(request.getDescription())
                .scheduledDate(request.getScheduledDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .meetingLink(request.getMeetingLink())
                .archived(false)
                .build();

        Interview saved = interviewRepository.save(interview);

        updateCandidateStatusFromInterview(candidate, request.getType(), userId);

        log.info("Interview scheduled: {} for candidate {} by user {}", request.getType(), candidateId, userId);
        return interviewMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewResponse getById(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId) {
        SecurityUtils.getCurrentUserId();
        Interview interview = findActiveInterview(workspaceId, departmentId, candidateId, interviewId);
        return interviewMapper.toResponse(interview);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InterviewResponse> listByCandidate(UUID workspaceId, UUID departmentId, UUID candidateId, Pageable pageable) {
        SecurityUtils.getCurrentUserId();
        findActiveCandidate(workspaceId, departmentId, candidateId);
        return interviewRepository.findAllByCandidate_Id(candidateId, pageable)
                .map(interviewMapper::toResponse);
    }

    @Override
    public InterviewResponse update(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId, UpdateInterviewRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Interview interview = findActiveInterview(workspaceId, departmentId, candidateId, interviewId);

        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            throw new BadRequestException("Cannot update a Completed interview.");
        }
        if (interview.getStatus() == InterviewStatus.CANCELLED) {
            throw new BadRequestException("Cannot update a cancelled interview.");
        }

        Instant newStartTime = request.getStartTime() != null ? request.getStartTime() : interview.getStartTime();
        Instant newEndTime = request.getEndTime() != null ? request.getEndTime() : interview.getEndTime();
        validateInterviewTiming(newStartTime, newEndTime, false);

        boolean dateChanged = false;

        if (request.getType() != null) {
            interview.setType(request.getType());
        }
        if (request.getTitle() != null) {
            interview.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            interview.setDescription(request.getDescription());
        }
        if (request.getScheduledDate() != null) {
            interview.setScheduledDate(request.getScheduledDate());
            dateChanged = true;
        }
        if (request.getStartTime() != null) {
            interview.setStartTime(request.getStartTime());
            dateChanged = true;
        }
        if (request.getEndTime() != null) {
            interview.setEndTime(request.getEndTime());
        }
        if (request.getLocation() != null) {
            interview.setLocation(request.getLocation());
        }
        if (request.getMeetingLink() != null) {
            interview.setMeetingLink(request.getMeetingLink());
        }

        if (dateChanged && interview.getStatus() == InterviewStatus.SCHEDULED) {
            interview.setStatus(InterviewStatus.RESCHEDULED);
        }

        Interview saved = interviewRepository.save(interview);
        log.info("Interview updated: {} by user {}", saved.getId(), userId);
        return interviewMapper.toResponse(saved);
    }

    @Override
    public void cancel(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Interview interview = findActiveInterview(workspaceId, departmentId, candidateId, interviewId);

        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a Completed interview.");
        }
        if (interview.getStatus() == InterviewStatus.CANCELLED) {
            return;
        }

        interview.setStatus(InterviewStatus.CANCELLED);
        interviewRepository.save(interview);
        log.info("Interview cancelled: {} by user {}", interviewId, userId);
    }

    @Override
    public void delete(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Interview interview = findActiveInterview(workspaceId, departmentId, candidateId, interviewId);

        interview.setArchived(true);
        interviewRepository.save(interview);
        log.info("Interview archived: {} by user {}", interviewId, userId);
    }

    @Override
    public InterviewParticipantResponse addParticipant(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId, AddParticipantRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Interview interview = findActiveInterview(workspaceId, departmentId, candidateId, interviewId);

        if (participantRepository.existsByInterview_IdAndUser_Id(interviewId, request.getUserId())) {
            throw new ConflictException("User is already a participant in this interview.");
        }

        var user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        InterviewParticipant participant = InterviewParticipant.builder()
                .interview(interview)
                .user(user)
                .role(request.getRole())
                .build();

        InterviewParticipant saved = participantRepository.save(participant);
        log.info("Participant added: user {} to interview {} by user {}", request.getUserId(), interviewId, userId);
        return interviewMapper.toResponse(saved);
    }

    @Override
    public void removeParticipant(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId, UUID participantId) {
        SecurityUtils.getCurrentUserId();

        InterviewParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found."));

        if (!participant.getInterview().getId().equals(interviewId)) {
            throw new ResourceNotFoundException("Participant not found.");
        }

        participantRepository.delete(participant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewParticipantResponse> listParticipants(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId) {
        SecurityUtils.getCurrentUserId();
        findActiveInterview(workspaceId, departmentId, candidateId, interviewId);
        return participantRepository.findAllByInterview_Id(interviewId)
                .stream()
                .map(interviewMapper::toResponse)
                .toList();
    }

    @Override
    public InterviewFeedbackResponse submitFeedback(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId, InterviewFeedbackRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Interview interview = findActiveInterview(workspaceId, departmentId, candidateId, interviewId);

        if (interview.getStatus() != InterviewStatus.COMPLETED) {
            throw new BadRequestException("Cannot submit feedback before the interview is Completed.");
        }

        InterviewFeedback feedback = InterviewFeedback.builder()
                .interview(interview)
                .rating(request.getRating())
                .recommendation(request.getRecommendation())
                .notes(request.getNotes())
                .build();

        InterviewFeedback saved = feedbackRepository.save(feedback);
        log.info("Feedback submitted for interview {} by user {}", interviewId, userId);
        return interviewMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewFeedbackResponse> getFeedbacks(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId) {
        SecurityUtils.getCurrentUserId();
        findActiveInterview(workspaceId, departmentId, candidateId, interviewId);
        return feedbackRepository.findAllByInterview_IdOrderByCreatedAtDesc(interviewId)
                .stream()
                .map(interviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getTodayInterviews(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        Instant startOfDay = LocalDate.now(ZoneId.systemDefault()).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = LocalDate.now(ZoneId.systemDefault()).atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();

        return interviewRepository.findByDepartmentIdAndScheduledDateRangeAndStatusIn(
                        departmentId, startOfDay, endOfDay, List.of(InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED))
                .stream()
                .filter(i -> !i.isArchived())
                .map(interviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getThisWeekInterviews(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        Instant start = startOfWeek.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant end = endOfWeek.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();

        return interviewRepository.findByDepartmentIdAndScheduledDateRangeAndStatusIn(
                        departmentId, start, end, List.of(InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED))
                .stream()
                .filter(i -> !i.isArchived())
                .map(interviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getUpcomingInterviews(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        Instant now = Instant.now();
        return interviewRepository.findScheduledByDepartmentId(departmentId, InterviewStatus.SCHEDULED)
                .stream()
                .filter(i -> !i.isArchived() && i.getScheduledDate() != null && i.getScheduledDate().isAfter(now))
                .map(interviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getCompletedInterviews(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        return interviewRepository.findByDepartmentIdAndStatus(departmentId, InterviewStatus.COMPLETED)
                .stream()
                .filter(i -> !i.isArchived())
                .map(interviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewStatistics getStatistics(UUID workspaceId, UUID departmentId) {
        SecurityUtils.getCurrentUserId();
        findActiveDepartment(workspaceId, departmentId);

        Instant startOfDay = LocalDate.now(ZoneId.systemDefault()).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = LocalDate.now(ZoneId.systemDefault()).atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();
        Instant now = Instant.now();

        InterviewStatistics stats = new InterviewStatistics();
        stats.setInterviewsToday(interviewRepository.countByDepartmentIdAndScheduledDateRangeAndStatus(
                departmentId, startOfDay, endOfDay, InterviewStatus.SCHEDULED));
        stats.setUpcomingInterviews(interviewRepository.countUpcomingByDepartmentId(departmentId, now, InterviewStatus.SCHEDULED));
        stats.setCompletedInterviews(interviewRepository.countByDepartmentIdAndStatus(departmentId, InterviewStatus.COMPLETED));
        stats.setCancelledInterviews(interviewRepository.countByDepartmentIdAndStatus(departmentId, InterviewStatus.CANCELLED));
        stats.setAverageRating(interviewRepository.averageRatingByDepartmentId(departmentId));
        stats.setCandidatesWaitingForInterview(interviewRepository.countCandidatesWaitingForInterview(departmentId));

        return stats;
    }

    private void validateInterviewTiming(Instant startTime, Instant endTime, boolean allowPast) {
        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time.");
        }
        if (!allowPast && startTime != null && startTime.isBefore(Instant.now())) {
            throw new BadRequestException("Cannot schedule an interview in the past.");
        }
    }

    private void updateCandidateStatusFromInterview(Candidate candidate, InterviewType type, UUID userId) {
        CandidateStatus targetStatus = INTERVIEW_TO_CANDIDATE_STATUS.get(type);
        if (targetStatus == null) {
            return;
        }
        if (candidate.getCurrentStatus() == targetStatus) {
            return;
        }

        CandidateStatus previousStatus = candidate.getCurrentStatus();
        candidate.setCurrentStatus(targetStatus);

        CandidateStatusHistory history = CandidateStatusHistory.builder()
                .candidate(candidate)
                .previousStatus(previousStatus)
                .newStatus(targetStatus)
                .changedBy(userId)
                .reason("Auto-updated: " + type + " interview scheduled")
                .build();

        candidate.getStatusHistories().add(history);
        candidateRepository.save(candidate);
        log.info("Candidate status auto-updated: {} â†’ {} due to interview scheduling", previousStatus, targetStatus);
    }

    private Interview findActiveInterview(UUID workspaceId, UUID departmentId, UUID candidateId, UUID interviewId) {
        Candidate candidate = findActiveCandidate(workspaceId, departmentId, candidateId);

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found."));

        if (interview.isArchived()) {
            throw new ResourceNotFoundException("Interview not found.");
        }
        if (!interview.getCandidate().getId().equals(candidateId)) {
            throw new ResourceNotFoundException("Interview not found.");
        }
        if (!interview.getCandidate().getDepartment().getId().equals(departmentId)) {
            throw new ResourceNotFoundException("Interview not found.");
        }

        return interview;
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
                .filter(dept -> dept.getStatus() == com.trio.backend.enums.WorkspaceStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
    }
}
