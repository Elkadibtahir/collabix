package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Summary widget of members pour le Workspace Dashboard.
 *
 * <p>Contient les statistics of members of the workspace :
 * total, actives, pending of activation, comptes lockeds
 * et comptes suspendeds.</p>
 */
@Getter
@Setter
public class MemberSummaryWidget {

    /**
     * Nombre total de members in the workspace.
     */
    private long totalMembers;

    /**
     * Nombre de members actives.
     */
    private long activeMembers;

    /**
     * Nombre de members pending of activation.
     */
    private long pendingActivation;

    /**
     * Nombre de comptes lockeds.
     */
    private long lockedAccounts;

    /**
     * Nombre de comptes suspendeds.
     */
    private long suspendedAccounts;
}

