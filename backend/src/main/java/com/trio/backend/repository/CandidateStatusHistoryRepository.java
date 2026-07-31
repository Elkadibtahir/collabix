package com.trio.backend.repository;

import com.trio.backend.entity.CandidateStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CandidateStatusHistoryRepository extends JpaRepository<CandidateStatusHistory, UUID> {

    List<CandidateStatusHistory> findAllByCandidate_IdOrderByCreatedAtDesc(UUID candidateId);
}
