package com.trio.backend.dto.organisation.handover;

import com.trio.backend.dto.user.UserSummaryResponse;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Response for a HandoverComment.
 */
@Getter
@Setter
public class HandoverCommentResponse {

    private UUID id;

    private UUID handoverEntryId;

    private UserSummaryResponse author;

    private String content;

    private Instant createdAt;

    private Instant updatedAt;
}
