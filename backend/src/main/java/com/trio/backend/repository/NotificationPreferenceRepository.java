package com.trio.backend.repository;

import com.trio.backend.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {

    Optional<NotificationPreference> findByUserIdAndWorkspaceIdAndNotificationType(
            UUID userId, UUID workspaceId, String notificationType);

    List<NotificationPreference> findByUserIdAndWorkspaceId(UUID userId, UUID workspaceId);

    void deleteByUserIdAndWorkspaceId(UUID userId, UUID workspaceId);
}
