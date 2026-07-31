package com.trio.backend.dto.organisation.checklist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateChecklistRequest {
    @NotBlank
    @Size(max = 255)
    private String title;
}
