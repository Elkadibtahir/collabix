package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.AttachmentSearchCriteria;
import com.trio.backend.dto.hr.AttachmentStatistics;
import com.trio.backend.dto.hr.CandidateAttachmentResponse;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface CandidateAttachmentService {

    CandidateAttachmentResponse upload(UUID workspaceId, UUID departmentId, UUID candidateId,
                                        MultipartFile file, String description, com.trio.backend.enums.AttachmentType attachmentType);

    CandidateAttachmentResponse replace(UUID workspaceId, UUID departmentId, UUID candidateId, UUID attachmentId,
                                         MultipartFile file, String description);

    CandidateAttachmentResponse getById(UUID workspaceId, UUID departmentId, UUID candidateId, UUID attachmentId);

    Page<CandidateAttachmentResponse> listByCandidate(UUID workspaceId, UUID departmentId, UUID candidateId, Pageable pageable);

    Page<CandidateAttachmentResponse> search(UUID workspaceId, UUID departmentId, AttachmentSearchCriteria criteria, Pageable pageable);

    Resource download(UUID workspaceId, UUID departmentId, UUID candidateId, UUID attachmentId);

    void delete(UUID workspaceId, UUID departmentId, UUID candidateId, UUID attachmentId);

    AttachmentStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
