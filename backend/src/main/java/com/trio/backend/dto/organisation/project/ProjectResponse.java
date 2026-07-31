package com.trio.backend.dto.organisation.project;

import com.trio.backend.enums.ProjectPriority;
import com.trio.backend.enums.WorkspaceStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class ProjectResponse {

    private UUID id;

    private UUID departmentId;

    private UUID workspaceId;

    private String name;

    private String description;

    private WorkspaceStatus status;

    private ProjectPriority priority;

    private LocalDate startDate;

    private LocalDate endDate;

    private UUID managerId;

    private String managerName;

    private String departmentName;

    private String color;

    private String icon;

    private Instant createdAt;

    private Instant updatedAt;
}
