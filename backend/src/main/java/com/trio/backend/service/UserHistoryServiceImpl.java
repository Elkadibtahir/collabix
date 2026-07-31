package com.trio.backend.service;

import com.trio.backend.dto.user.UserHistoryResponse;
import com.trio.backend.dto.user.UserHistorySearchCriteria;
import com.trio.backend.dto.user.UserHistoryStatisticsResponse;
import com.trio.backend.entity.User;
import com.trio.backend.entity.UserHistory;
import com.trio.backend.entity.Workspace;
import com.trio.backend.mapper.UserHistoryMapper;
import com.trio.backend.repository.UserHistoryRepository;
import com.trio.backend.repository.UserHistorySpecification;
import com.trio.backend.repository.UserRepository;
import com.trio.backend.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserHistoryServiceImpl implements UserHistoryService {

    private final UserHistoryRepository userHistoryRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserHistoryMapper userHistoryMapper;

    @Override
    public void record(UUID workspaceId, UUID userId, UUID performedById, String action, String oldValue, String newValue, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Workspace workspace = null;
        if (workspaceId != null) {
            workspace = workspaceRepository.findById(workspaceId)
                    .orElse(null);
        }

        User performedBy = null;
        if (performedById != null) {
            performedBy = userRepository.findById(performedById)
                    .orElse(null);
        }

        UserHistory history = UserHistory.builder()
                .user(user)
                .workspace(workspace)
                .performedBy(performedBy)
                .action(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .description(description)
                .createdAt(Instant.now())
                .build();

        userHistoryRepository.save(history);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserHistoryResponse> search(UUID workspaceId, UserHistorySearchCriteria criteria, Pageable pageable) {
        return userHistoryRepository.findAll(
                        UserHistorySpecification.withCriteria(criteria, workspaceId),
                        pageable
                )
                .map(userHistoryMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserHistoryStatisticsResponse getStatistics(UUID workspaceId) {

        long totalActions = userHistoryRepository.countByWorkspaceIdAndCreatedAtAfter(workspaceId, Instant.EPOCH);
        long roleChanges = userHistoryRepository.countByWorkspaceIdAndAction(workspaceId, UserHistory.ACTION_ROLE_ASSIGNED);
        long departmentTransfers = userHistoryRepository.countByWorkspaceIdAndAction(workspaceId, UserHistory.ACTION_DEPARTMENT_CHANGED);
        long suspensions = userHistoryRepository.countByWorkspaceIdAndAction(workspaceId, UserHistory.ACTION_SUSPENDED);
        long archives = userHistoryRepository.countByWorkspaceIdAndAction(workspaceId, UserHistory.ACTION_ARCHIVED);
        long restores = userHistoryRepository.countByWorkspaceIdAndAction(workspaceId, UserHistory.ACTION_RESTORED);
        long passwordResets = userHistoryRepository.countByWorkspaceIdAndAction(workspaceId, UserHistory.ACTION_PASSWORD_RESET);
        long recentActivity = userHistoryRepository.countByWorkspaceIdAndCreatedAtAfter(workspaceId, Instant.now().minusSeconds(7 * 24 * 60 * 60));

        Map<String, Long> actionsPerType = new LinkedHashMap<>();
        for (Object[] row : userHistoryRepository.countByActionGrouped(workspaceId)) {
            actionsPerType.put((String) row[0], (Long) row[1]);
        }

        Map<UUID, Long> mostActiveAdministrators = new LinkedHashMap<>();
        for (Object[] row : userHistoryRepository.countByPerformedByGrouped(workspaceId)) {
            mostActiveAdministrators.put((UUID) row[0], (Long) row[1]);
        }

        return UserHistoryStatisticsResponse.builder()
                .totalActions(totalActions)
                .actionsPerType(actionsPerType)
                .roleChanges(roleChanges)
                .departmentTransfers(departmentTransfers)
                .suspensions(suspensions)
                .archives(archives)
                .restores(restores)
                .passwordResets(passwordResets)
                .mostActiveAdministrators(mostActiveAdministrators)
                .recentActivity(recentActivity)
                .build();
    }

}
