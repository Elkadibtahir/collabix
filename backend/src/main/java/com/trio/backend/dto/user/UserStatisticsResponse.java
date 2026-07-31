package com.trio.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatisticsResponse {

    private long totalUsers;

    private long activeUsers;

    private long inactiveUsers;

    private long suspendedUsers;

    private long archivedUsers;

    private long softDeletedUsers;

    private long pendingActivationUsers;

    private long lockedUsers;

    private Map<String, Long> usersPerDepartment;

    private Map<String, Long> usersPerTeam;

    private Map<String, Long> usersPerRole;

    private long recentHires;

}
