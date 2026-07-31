package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Widget representant a project associÃ© Ã  the authenticated user
 * dans le Personal Dashboard.
 *
 * <p>Contient les information essentialles of the project dans lequel
 * the user est involved.</p>
 */
@Getter
@Setter
public class PersonalProjectWidget {

    /**
     * Identifiant of the project.
     */
    private UUID id;

    /**
     * Nom of the project.
     */
    private String name;

    /**
     * Nom of the department owner of the project.
     */
    private String departmentName;
}

