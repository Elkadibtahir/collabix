package com.trio.backend.service;

import com.trio.backend.dto.user.UserHistoryResponse;
import com.trio.backend.dto.user.UserHistorySearchCriteria;
import com.trio.backend.dto.user.UserHistoryStatisticsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserHistoryService {

    void record(UUID workspaceId, UUID userId, UUID performedById, String action, String oldValue, String newValue, String description);

    Page<UserHistoryResponse> search(UUID workspaceId, UserHistorySearchCriteria criteria, Pageable pageable);

    UserHistoryStatisticsResponse getStatistics(UUID workspaceId);

}
