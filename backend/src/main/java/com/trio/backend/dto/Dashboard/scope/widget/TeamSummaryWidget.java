package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Summary widget of teams pour le Workspace Dashboard.
 *
 * <p>Contient the namebre total of teams, the namebre of teams
 * actives et the namebre medium de members par team.</p>
 */
@Getter
@Setter
public class TeamSummaryWidget {

    /**
     * Nombre total of teams in the workspace.
     */
    private long totalTeams;

    /**
     * Nombre of teams actives.
     */
    private long activeTeams;

    /**
     * Nombre medium de members par team.
     */
    private double averageMembersPerTeam;
}

