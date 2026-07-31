package com.trio.backend.dto.organisation.comment;

import com.trio.backend.dto.organisation.attachment.AttachmentResponse;
import com.trio.backend.enums.CommentStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response for un Comment.
 */
@Getter
@Setter
public class CommentResponse {

    private UUID id;

    private UUID taskId;

    private String content;

    private CommentStatus status;

    private UUID parentCommentId;

    private Instant createdAt;

    private Instant updatedAt;

    private List<AttachmentResponse> attachments;
}

