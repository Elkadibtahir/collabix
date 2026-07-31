package com.trio.backend.dto.notification;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class NotificationPreferenceRequest {

    private String notificationType;

    private boolean emailEnabled = true;

    private boolean inAppEnabled = true;

    private String digestFrequency = "REALTIME";

    private LocalTime quietHoursStart;

    private LocalTime quietHoursEnd;
}
