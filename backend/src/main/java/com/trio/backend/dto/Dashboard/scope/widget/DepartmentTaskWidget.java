package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * @deprecated This widget was designed for the "departmentTasks" field in
 * {@link com.trio.backend.dto.Dashboard.scope.DepartmentDashboardResponse}
 * which was never populated. No builder or repository method references this class.
 * Retained for reference only. Will be removed in a future version.
 */
@Deprecated
@Getter
@Setter
public class DepartmentTaskWidget {

    /**
     * Identifiant de the task.
     */
    private UUID id;

    /**
     * Titre de the task.
     */
    private String title;

    /**
     * Status de the task.
     */
    private String status;

    /**
     * Nom of the project parent.
     */
    private String projectName;

    /**
     * Date of expiry.
     */
    private Instant dueAt;
}

