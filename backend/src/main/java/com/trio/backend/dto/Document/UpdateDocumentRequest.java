package com.trio.backend.dto.Document;

import com.trio.backend.entity.Document.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating an existing Document.
 *
 * <p>Supports status updates and metadata changes for document lifecycle management.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDocumentRequest {

    /**
     * The title or name of the document.
     * Optional for partial updates.
     */
    private String title;

    /**
     * The description or summary of the document.
     * Optional for partial updates.
     */
    private String description;

    /**
     * Functional category of the document.
     */
    private String category;

    /**
     * Comma-separated tags for search and categorization.
     */
    private String tags;

    /**
     * The new status of the document.
     * Can be ACTIVE, ARCHIVED, or DELETED for lifecycle management.
     */
    private DocumentStatus status;

    /**
     * Flag indicating whether the document content has been processed by AI.
     * Optional for tracking AI processing state.
     */
    private Boolean aiProcessed;

    /**
     * Flag indicating whether PDF export version is available.
     * Optional for tracking PDF export state.
     */
    private Boolean pdfExportAvailable;
}
