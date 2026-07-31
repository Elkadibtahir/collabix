package com.trio.backend.dto.organisation.department;

import com.trio.backend.enums.WorkspaceStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class DepartmentDetailsResponse {

    private UUID id;

    private UUID workspaceId;

    private String name;

    private String description;

    private WorkspaceStatus status;

    private Long teamCount;
}

