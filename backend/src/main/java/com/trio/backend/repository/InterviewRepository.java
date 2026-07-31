package com.trio.backend.repository;

import com.trio.backend.entity.Interview;
import com.trio.backend.enums.InterviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewRepository extends JpaRepository<Interview, UUID> {

    List<Interview> findAllByCandidate_IdOrderByCreatedAtDesc(UUID candidateId);

    Page<Interview> findAllByCandidate_Id(UUID candidateId, Pageable pageable);

    @Query("SELECT i FROM Interview i WHERE i.candidate.id = :candidateId AND i.status = :status")
    List<Interview> findByCandidateIdAndStatus(@Param("candidateId") UUID candidateId, @Param("status") InterviewStatus status);

    long countByCandidate_Id(UUID candidateId);

    boolean existsByCandidate_IdAndTypeAndStatusIn(
            UUID candidateId, com.trio.backend.enums.InterviewType type, List<InterviewStatus> statuses);

    @Query("SELECT i FROM Interview i WHERE i.candidate.department.id = :departmentId AND i.scheduledDate >= :startOfDay AND i.scheduledDate < :endOfDay AND i.status = :status")
    List<Interview> findByDepartmentIdAndScheduledDateRangeAndStatus(
            @Param("departmentId") UUID departmentId,
            @Param("startOfDay") Instant startOfDay,
            @Param("endOfDay") Instant endOfDay,
            @Param("status") InterviewStatus status);

    @Query("SELECT i FROM Interview i WHERE i.candidate.department.id = :departmentId AND i.scheduledDate >= :start AND i.scheduledDate <= :end AND i.status IN :statuses")
    List<Interview> findByDepartmentIdAndScheduledDateRangeAndStatusIn(
            @Param("departmentId") UUID departmentId,
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("statuses") List<InterviewStatus> statuses);

    @Query("SELECT i FROM Interview i WHERE i.candidate.department.id = :departmentId AND i.scheduledDate >= :from AND i.status = :status ORDER BY i.scheduledDate ASC")
    List<Interview> findUpcomingByDepartmentId(
            @Param("departmentId") UUID departmentId,
            @Param("from") Instant from,
            @Param("status") InterviewStatus status);

    @Query("SELECT i FROM Interview i WHERE i.candidate.department.id = :departmentId AND i.status = :status ORDER BY i.scheduledDate DESC")
    List<Interview> findByDepartmentIdAndStatus(
            @Param("departmentId") UUID departmentId,
            @Param("status") InterviewStatus status);

    @Query("SELECT i FROM Interview i WHERE i.candidate.department.id = :departmentId AND i.candidate.archived = false AND i.status = :status ORDER BY i.scheduledDate ASC")
    List<Interview> findScheduledByDepartmentId(@Param("departmentId") UUID departmentId, @Param("status") InterviewStatus status);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.candidate.department.id = :departmentId AND i.scheduledDate >= :startOfDay AND i.scheduledDate < :endOfDay AND i.status = :status")
    long countByDepartmentIdAndScheduledDateRangeAndStatus(
            @Param("departmentId") UUID departmentId,
            @Param("startOfDay") Instant startOfDay,
            @Param("endOfDay") Instant endOfDay,
            @Param("status") InterviewStatus status);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.candidate.department.id = :departmentId AND i.scheduledDate > :now AND i.status = :status")
    long countUpcomingByDepartmentId(
            @Param("departmentId") UUID departmentId,
            @Param("now") Instant now,
            @Param("status") InterviewStatus status);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.candidate.department.id = :departmentId AND i.status = :status")
    long countByDepartmentIdAndStatus(
            @Param("departmentId") UUID departmentId,
            @Param("status") InterviewStatus status);

    @Query("SELECT AVG(f.rating) FROM InterviewFeedback f WHERE f.interview.candidate.department.id = :departmentId")
    Double averageRatingByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT COUNT(c) FROM Candidate c WHERE c.department.id = :departmentId AND c.archived = false AND c.currentStatus IN ('APPLIED', 'CV_REVIEW')")
    long countCandidatesWaitingForInterview(@Param("departmentId") UUID departmentId);

    @Query("SELECT i FROM Interview i WHERE i.candidate.id = :candidateId AND i.status = :status AND i.type = :type")
    Optional<Interview> findByCandidateIdAndStatusAndType(
            @Param("candidateId") UUID candidateId,
            @Param("status") InterviewStatus status,
            @Param("type") com.trio.backend.enums.InterviewType type);
}
