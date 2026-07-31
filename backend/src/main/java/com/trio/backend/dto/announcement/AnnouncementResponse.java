package com.trio.backend.dto.announcement;

import com.trio.backend.enums.AnnouncementStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class AnnouncementResponse {

    private UUID id;
    private UUID workspaceId;
    private UUID departmentId;
    private UUID teamId;
    private UUID projectId;
    private String title;
    private String content;
    private boolean isPinned;
    private AnnouncementStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;
}
