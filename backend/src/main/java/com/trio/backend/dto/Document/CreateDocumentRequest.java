package com.trio.backend.dto.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for creating a new Document.
 *
 * <p>Represents the clinkt request payload for creating a document in a Project or Task.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDocumentRequest {

    /**
     * The title or name of the document.
     * Required for user-facing reference and search operations.
     */
    @NotBlank(message = "Document title is required")
    private String title;

    /**
     * The description or summary of the document.
     * Optional for additional context.
     */
    private String description;

    /**
     * The original file name.
     * Required for download operations and user reference.
     */
    @NotBlank(message = "File name is required")
    private String fileName;

    /**
     * The MIME type of the file (e.g., "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document").
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
     * The ID of the Task this document is associated with.
     * Optional. If null, the document is at project level.
     */
    private UUID taskId;

    /**
     * Functional category of the document.
     */
    private String category;

    /**
     * Comma-separated tags for search and categorization.
     */
    private String tags;
}
