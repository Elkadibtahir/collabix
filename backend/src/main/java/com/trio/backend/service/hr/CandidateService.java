package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.CandidateResponse;
import com.trio.backend.dto.hr.CandidateSearchCriteria;
import com.trio.backend.dto.hr.CandidateStatistics;
import com.trio.backend.dto.hr.CandidateStatusChangeRequest;
import com.trio.backend.dto.hr.CandidateTimelineEntry;
import com.trio.backend.dto.hr.CreateCandidateRequest;
import com.trio.backend.dto.hr.UpdateCandidateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CandidateService {

    CandidateResponse create(UUID workspaceId, UUID departmentId, CreateCandidateRequest request);

    CandidateResponse getById(UUID workspaceId, UUID departmentId, UUID candidateId);

    Page<CandidateResponse> list(UUID workspaceId, UUID departmentId, CandidateSearchCriteria criteria, Pageable pageable);

    CandidateResponse update(UUID workspaceId, UUID departmentId, UUID candidateId, UpdateCandidateRequest request);

    void delete(UUID workspaceId, UUID departmentId, UUID candidateId);

    CandidateResponse changeStatus(UUID workspaceId, UUID departmentId, UUID candidateId, CandidateStatusChangeRequest request);

    List<CandidateTimelineEntry> getTimeline(UUID workspaceId, UUID departmentId, UUID candidateId);

    CandidateStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
