package com.trio.backend.dto.organisation.mention;

import com.trio.backend.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Mention response.
 *
 * <p>Represents the Complete state of a mention for API clinkts.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentionResponse {

    /**
     * The unique identifier of the mention.
     */
    private UUID id;

    /**
     * The ID of the comment in which this mention appears.
     */
    private UUID commentId;

    /**
     * The ID of the user being mentioned.
     */
    private UUID userId;

    /**
     * The current status of the mention (ACTIVE or INACTIVE).
     */
    private TaskStatus status;

    /**
     * Flag indicating whether the notification for this mention has been sent.
     */
    private boolean notificationSent;

    /**
     * Timestamp when the mention was created.
     */
    private LocalDateTime createdAt;

    /**
     * ID of the user who created the mention.
     */
    private UUID createdBy;

    /**
     * Timestamp when the mention was last updated.
     */
    private LocalDateTime updatedAt;

    /**
     * ID of the user who last updated the mention.
     */
    private UUID updatedBy;
}
