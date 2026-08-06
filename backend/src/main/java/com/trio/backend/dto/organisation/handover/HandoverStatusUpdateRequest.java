package com.trio.backend.dto.organisation.handover;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request for a handover status transition (accept / reject / complete / archive).
 */
@Getter
@Setter
public class HandoverStatusUpdateRequest {

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
