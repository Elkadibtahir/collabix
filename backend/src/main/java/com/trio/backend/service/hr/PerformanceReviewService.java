package com.trio.backend.service.hr;

import com.trio.backend.dto.hr.CreatePerformanceReviewRequest;
import com.trio.backend.dto.hr.PerformanceReviewResponse;
import com.trio.backend.dto.hr.PerformanceReviewSearchCriteria;
import com.trio.backend.dto.hr.PerformanceReviewStatistics;
import com.trio.backend.dto.hr.UpdatePerformanceReviewRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PerformanceReviewService {

    PerformanceReviewResponse create(UUID workspaceId, UUID departmentId, CreatePerformanceReviewRequest request);

    PerformanceReviewResponse getById(UUID workspaceId, UUID departmentId, UUID reviewId);

    Page<PerformanceReviewResponse> search(UUID workspaceId, UUID departmentId, PerformanceReviewSearchCriteria criteria, Pageable pageable);

    PerformanceReviewResponse update(UUID workspaceId, UUID departmentId, UUID reviewId, UpdatePerformanceReviewRequest request);

    PerformanceReviewResponse submit(UUID workspaceId, UUID departmentId, UUID reviewId);

    PerformanceReviewResponse approve(UUID workspaceId, UUID departmentId, UUID reviewId);

    PerformanceReviewResponse reject(UUID workspaceId, UUID departmentId, UUID reviewId, String reason);

    PerformanceReviewResponse archive(UUID workspaceId, UUID departmentId, UUID reviewId);

    void delete(UUID workspaceId, UUID departmentId, UUID reviewId);

    PerformanceReviewStatistics getStatistics(UUID workspaceId, UUID departmentId);
}
