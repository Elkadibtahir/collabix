package com.trio.backend.dto.announcement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateAnnouncementRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    private String content;

    private boolean isPinned;

    private UUID departmentId;

    private UUID teamId;

    private UUID projectId;
}
