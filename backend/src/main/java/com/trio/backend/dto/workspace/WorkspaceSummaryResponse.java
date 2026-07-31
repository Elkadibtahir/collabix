package com.trio.backend.dto.workspace;

import com.trio.backend.enums.WorkspaceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceSummaryResponse {

    private UUID id;

    private String name;

    private String description;

    private WorkspaceStatus status;

    private Long memberCount;

    private Long teamCount;

    private Long projectCount;

    private Instant createdAt;

}
