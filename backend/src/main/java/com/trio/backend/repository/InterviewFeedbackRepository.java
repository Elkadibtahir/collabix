package com.trio.backend.repository;

import com.trio.backend.entity.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, UUID> {

    List<InterviewFeedback> findAllByInterview_IdOrderByCreatedAtDesc(UUID interviewId);

    long countByInterview_Id(UUID interviewId);
}
