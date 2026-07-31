package com.trio.backend.dto.organisation.checklist;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateChecklistItemRequest {
    @Size(max = 500)
    private String content;

    private Boolean completed;

    private Integer sortOrder;
}
