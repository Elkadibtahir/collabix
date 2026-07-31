package com.trio.backend.dto.organisation.checklist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateChecklistItemRequest {
    @NotBlank
    @Size(max = 500)
    private String content;
}
