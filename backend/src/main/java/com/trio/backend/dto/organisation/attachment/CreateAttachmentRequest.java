package com.trio.backend.dto.organisation.attachment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for creating a new Attachment.
 *
 * <p>Represents the clinkt request payload for attaching a file to a Task or Comment.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAttachmentRequest {

    /**
     * The original file name.
     * Required for user-facing reference and download operations.
     */
    @NotBlank(message = "File name is required")
    private String fileName;

    /**
     * The MIME type of the file (e.g., "application/pdf", "image/jpeg").
     * Required for proper content-type headers on download and validation.
     */
    @NotBlank(message = "MIME type is required")
    private String mimeType;

    /**
     * The size of the file in bytes.
     * Required for quota checks, download progress, and storage management.
     */
    @NotNull(message = "File size is required")
    @Positive(message = "File size must be positive")
    private Long fileSize;

    /**
     * The storage path or identifier for the file.
     * Could be a S3 key, cloud storage path, or local file system path.
     * Required for resorteval and deletion operations.
     */
    @NotBlank(message = "Storage path is required")
    private String storagePath;

    /**
     * The ID of the Comment this attachment is associated with.
     * Optional. If null, the attachment is tied only to the Task.
     */
    private UUID commentId;
}
