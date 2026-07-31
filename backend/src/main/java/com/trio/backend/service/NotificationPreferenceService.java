package com.trio.backend.service;

import com.trio.backend.dto.notification.NotificationPreferenceRequest;
import com.trio.backend.dto.notification.NotificationPreferenceResponse;

import java.util.List;
import java.util.UUID;

public interface NotificationPreferenceService {

    List<NotificationPreferenceResponse> getPreferences(UUID workspaceId);

    NotificationPreferenceResponse updatePreference(UUID workspaceId, UUID preferenceId, NotificationPreferenceRequest request);

    NotificationPreferenceResponse createPreference(UUID workspaceId, NotificationPreferenceRequest request);

    void deletePreference(UUID workspaceId, UUID preferenceId);
}
