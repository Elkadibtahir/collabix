package com.trio.backend.dto.organisation.handover;

import com.trio.backend.dto.user.UserSummaryResponse;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Response for a HandoverAttachment.
 */
@Getter
@Setter
public class HandoverAttachmentResponse {

    private UUID id;

    private UUID handoverEntryId;

    private String fileName;

    private Long fileSize;

    private String contentType;

    private String storageKey;

    private UserSummaryResponse uploadedBy;

    private Instant createdAt;
}
