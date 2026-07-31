package com.trio.backend.dto.organisation.department;

import com.trio.backend.enums.WorkspaceStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Response summarye pour un Department.
 */
@Getter
@Setter
public class DepartmentSummaryResponse {


    private UUID id;

    private UUID workspaceId;

    private String name;

    private WorkspaceStatus status;

    private Long teamCount;
}

