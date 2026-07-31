package com.trio.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserHistoryStatisticsResponse {

    private long totalActions;

    private Map<String, Long> actionsPerType;

    private long roleChanges;

    private long departmentTransfers;

    private long suspensions;

    private long archives;

    private long restores;

    private long passwordResets;

    private Map<UUID, Long> mostActiveAdministrators;

    private long recentActivity;

}
