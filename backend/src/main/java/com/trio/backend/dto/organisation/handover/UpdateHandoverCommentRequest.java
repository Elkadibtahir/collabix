package com.trio.backend.dto.organisation.handover;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request to update a comment on a HandoverEntry.
 */
@Getter
@Setter
public class UpdateHandoverCommentRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 100000, message = "Content must not exceed 100000 characters")
    private String content;
}
