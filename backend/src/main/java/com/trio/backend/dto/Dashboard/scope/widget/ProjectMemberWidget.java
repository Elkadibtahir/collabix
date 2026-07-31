package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * @deprecated This widget was designed for a potential "members" section in
 * {@link com.trio.backend.dto.Dashboard.scope.ProjectDashboardResponse}
 * goal was never used. No builder or repository method references this class.
 * Retained for reference only. Will be removed in a future version.
 */
@Deprecated
@Getter
@Setter
public class ProjectMemberWidget {

    /**
     * Identifiant of the member (user).
     */
    private UUID id;

    /**
     * PrÃ©name of the member.
     */
    private String firstName;

    /**
     * Nom of the member.
     */
    private String lastName;

    /**
     * Email of the member.
     */
    private String email;

    /**
     * Role of the member in the workspace.
     */
    private String role;

    /**
     * Nom de the team Ã  laquelle the member belong.
     */
    private String teamName;

    /**
     * Status of the member dans the team (ACTIVE, INVITED, SUSPENDED, LEFT).
     */
    private String memberStatus;
}

