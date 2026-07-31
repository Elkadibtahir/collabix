package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Widget statistics of members de the team pour le Team Dashboard.
 *
 * <p>Fournit une vue d'ensemble de la composition de the team :
 * members totaux, actives, inactives (suspendeds + partis) et
 * invitations pending.</p>
 */
@Getter
@Setter
public class TeamStatisticsWidget {

    /**
     * Nombre total de members dans the team.
     */
    private long totalMembers;

    /**
     * Nombre de members actives.
     */
    private long activeMembers;

    /**
     * Nombre de members inactives (suspendeds + partis).
     */
    private long inactiveMembers;

    /**
     * Nombre d'invitations pending.
     */
    private long pendingInvitations;
}

