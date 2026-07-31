package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Widget representant a project of a department dans le
 * Department Dashboard.
 */
@Getter
@Setter
public class DepartmentProjectWidget {

    /**
     * Identifiant of the project.
     */
    private UUID id;

    /**
     * Nom of the project.
     */
    private String name;

    /**
     * Status of the project.
     */
    private String status;

    /**
     * Nombre de tasks dans ce project.
     */
    private long taskCount;
}
