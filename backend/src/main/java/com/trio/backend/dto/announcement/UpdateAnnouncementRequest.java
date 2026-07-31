package com.trio.backend.dto.announcement;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAnnouncementRequest {

    @Size(max = 255)
    private String title;

    private String content;

    private Boolean isPinned;
}
