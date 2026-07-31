package com.trio.backend.dto.organisation.mention;

import com.trio.backend.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating an existing Mention.
 *
 * <p>Supports status updates and notification tracking state.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMentionRequest {

    /**
     * The new status of the mention.
     * Can be ACTIVE or INACTIVE for soft-delete support.
     */
    private TaskStatus status;

    /**
     * Flag indicating whether the notification for this mention has been sent.
     * Used to track notification delivery state.
     */
    private Boolean notificationSent;
}
