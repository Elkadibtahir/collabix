package com.trio.backend.dto.notification;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
public class NotificationPreferenceResponse {

    private UUID id;

    private UUID userId;

    private UUID workspaceId;

    private String notificationType;

    private boolean emailEnabled;

    private boolean inAppEnabled;

    private String digestFrequency;

    private LocalTime quietHoursStart;

    private LocalTime quietHoursEnd;
}
