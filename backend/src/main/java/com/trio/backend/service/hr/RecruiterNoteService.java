package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.CreateRecruiterNoteRequest;
import com.trio.backend.dto.hr.RecruiterNoteResponse;
import com.trio.backend.dto.hr.RecruiterNoteSearchCriteria;
import com.trio.backend.dto.hr.RecruiterNoteStatistics;
import com.trio.backend.dto.hr.UpdateRecruiterNoteRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface RecruiterNoteService {

    RecruiterNoteResponse create(UUID workspaceId, UUID departmentId, CreateRecruiterNoteRequest request);

    RecruiterNoteResponse getById(UUID workspaceId, UUID departmentId, UUID candidateId, UUID noteId);

    Page<RecruiterNoteResponse> listByCandidate(UUID workspaceId, UUID departmentId, UUID candidateId, Pageable pageable);

    Page<RecruiterNoteResponse> search(UUID workspaceId, UUID departmentId, RecruiterNoteSearchCriteria criteria, Pageable pageable);

    RecruiterNoteResponse update(UUID workspaceId, UUID departmentId, UUID candidateId, UUID noteId, UpdateRecruiterNoteRequest request);

    void delete(UUID workspaceId, UUID departmentId, UUID candidateId, UUID noteId);

    RecruiterNoteStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
