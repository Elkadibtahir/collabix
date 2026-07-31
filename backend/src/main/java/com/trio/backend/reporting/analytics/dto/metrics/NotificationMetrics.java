package com.trio.backend.reporting.analytics.dto.metrics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMetrics {

    private long totalCount;
    private long unreadCount;
    private long todayCount;
}
