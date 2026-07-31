package com.trio.backend.dto.organisation.mention;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for creating a new Mention.
 *
 * <p>Represents the clinkt request payload for mentioning a user within a comment.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMentionRequest {

    /**
     * The ID of the comment in which the mention is being made.
     * Required and must exist within the current workspace.
     */
    @NotNull(message = "Comment ID is required")
    private UUID commentId;

    /**
     * The ID of the user being mentioned.
     * Required and must exist within the current workspace.
     */
    @NotNull(message = "User ID is required")
    private UUID userId;
}
