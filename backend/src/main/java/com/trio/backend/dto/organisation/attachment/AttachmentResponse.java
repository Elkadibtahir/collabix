package com.trio.backend.dto.organisation.attachment;

import com.trio.backend.entity.Attachment.AttachmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Attachment response.
 *
 * <p>Represents the Complete state of an attachment for API clinkts.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponse {

    /**
     * The unique identifier of the attachment.
     */
    private UUID id;

    /**
     * The ID of the task this attachment is associated with.
     */
    private UUID taskId;

    /**
     * The ID of the comment this attachment is associated with.
     * Null if the attachment is tied only to the task.
     */
    private UUID commentId;

    /**
     * The original file name.
     */
    private String fileName;

    /**
     * The MIME type of the file.
     */
    private String mimeType;

    /**
     * The size of the file in bytes.
     */
    private Long fileSize;

    /**
     * The storage path or identifier for the file.
     */
    private String storagePath;

    /**
     * The current status of the attachment (ACTIVE or DELETED).
     */
    private AttachmentStatus status;

    /**
     * Timestamp when the attachment was created.
     */
    private LocalDateTime createdAt;

    /**
     * ID of the user who created the attachment.
     */
    private UUID createdBy;

    /**
     * Timestamp when the attachment was last updated.
     */
    private LocalDateTime updatedAt;

    /**
     * ID of the user who last updated the attachment.
     */
    private UUID updatedBy;
}
