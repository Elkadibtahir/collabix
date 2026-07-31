package com.trio.backend.dto.organisation.checklist;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateChecklistRequest {
    @Size(max = 255)
    private String title;
}
