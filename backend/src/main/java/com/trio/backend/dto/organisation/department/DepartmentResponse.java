package com.trio.backend.dto.organisation.department;

import com.trio.backend.enums.WorkspaceStatus;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Response Complete pour un Department.
 */
@Getter
@Setter
public class DepartmentResponse {

    private UUID id;

    private UUID workspaceId;

    private String name;

    private String description;

    private WorkspaceStatus status;

    private Instant createdAt;

    private Instant updatedAt;

    private Long teamCount;
}

