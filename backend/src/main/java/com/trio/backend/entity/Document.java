package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.ApprovalStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Document represents a document attached to a Project or optionally to a Task.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>A Document belongs to exactly one Project (required).</li>
 *     <li>A Document may belong to one Task (optional) for task-level documentation.</li>
 *     <li>Tenant isolation is ensured via the chain: Document -> Project -> Department -> Workspace.</li>
 *     <li>Designed for future enhancements: Versioning, AI processing, Cloud storage, PDF export.</li>
 *     <li>Soft-delete status via DocumentStatus enum.</li>
 *     <li>File metadata (name, size, MIME type, storage path) is stored for retrieval and validation.</li>
 *     <li>Version tracking fields prepared for future implementation without schema changes.</li>
 * </ul>
 */
@Entity
@Table(
        name = "documents",
        indexes = {
                @Index(name = "idx_documents_project_id", columnList = "project_id"),
                @Index(name = "idx_documents_task_id", columnList = "task_id"),
                @Index(name = "idx_documents_status", columnList = "status"),
                @Index(name = "idx_documents_created_at", columnList = "created_at"),
                @Index(name = "idx_documents_project_status", columnList = "project_id, status"),
                @Index(name = "idx_documents_created_by", columnList = "created_by")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document extends AuditableEntity {

    /**
     * The Project this document is associated with.
     * Required. Lazy loaded to optimize query performance.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * The Task this document is associated with.
     * Optional. If null, the document is at project level.
     * Lazy loaded to optimize query performance.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "task_id", nullable = true)
    private Task task;

    /**
     * The title or name of the document.
     * Required for user-facing reference and search operations.
     */
    @NotBlank(message = "Document title is required")
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    /**
     * The description or summary of the document.
     * Optional for additional context.
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * The original file name.
     * Required for download operations and user reference.
     */
    @NotBlank(message = "File name is required")
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    /**
     * The MIME type of the file (e.g., "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document").
     * Required for proper content-type headers on download and validation.
     */
    @NotBlank(message = "MIME type is required")
    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    /**
     * The size of the file in bytes.
     * Required for quota checks, download progress, and storage management.
     */
    @NotNull(message = "File size is required")
    @Positive(message = "File size must be positive")
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    /**
     * Functional category of the document for classification and filtering.
     * Examples: REPORT, CONTRACT, SPECIFICATION, MANUAL, TEMPLATE, OTHER
     */
    @Column(name = "category", length = 50)
    private String category;

    /**
     * Comma-separated tags for search and categorization.
     * Example: "urgent,finance,q3-2026"
     */
    @Column(name = "tags", length = 500)
    private String tags;

    /**
     * Number of times the document has been viewed.
     */
    @Column(name = "view_count")
    private Long viewCount = 0L;

    /**
     * The storage path or identifier for the file.
     * Could be a S3 key, cloud storage path, or local file system path.
     * Required for retrieval and deletion operations.
     * Prepared for Cloud Storage integration (AWS S3, Google Cloud Storage, Azure Blob Storage).
     */
    @NotBlank(message = "Storage path is required")
    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    /**
     * The status of the document (ACTIVE, ARCHIVED, DELETED).
     * Used for soft-delete support without removing data.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.ACTIVE;

    /**
     * Current version number of the document.
     * Prepared for future Versioning implementation.
     * Starts at 1 for initial creation.
     */
    @NotNull
    @Positive(message = "Version must be positive")
    @Column(name = "document_version", nullable = false) // Updated column name
    private Integer documentVersion = 1;

    /**
     * Flag indicating whether the document content has been processed by AI.
     * Prepared for future AI integration (summarization, analysis, categorization).
     * False by default, set to true after AI processing completes.
     */
    @Column(name = "ai_processed")
    private Boolean aiProcessed = false;

    /**
     * Storage type indicator for cloud storage abstraction.
     * Prepared for future Cloud Storage integration.
     * Examples: LOCAL, S3, GCS, AZURE
     */
    @Column(name = "storage_type", length = 20)
    private String storageType = "LOCAL";

    /**
     * Flag indicating whether PDF export version is available.
     * Prepared for future PDF Export functionality.
     * False by default, set to true after PDF generation.
     */
    @Column(name = "pdf_export_available")
    private Boolean pdfExportAvailable = false;

    /**
     * Approval status for document publishing workflow.
     * PENDING — awaiting manager review.
     * APPROVED — reviewed and published.
     * REJECTED — rejected by reviewer.
     * Defaults to APPROVED for backward compatibility.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    /**
     * ID of the user who approved/rejected this document.
     * Null if not yet reviewed.
     */
    @Column(name = "approved_by")
    private UUID approvedBy;

    /**
     * Timestamp when the document was approved/rejected.
     * Null if not yet reviewed.
     */
    @Column(name = "approved_at")
    private Instant approvedAt;

    /**
     * Initialize status and defaults if not set during entity creation.
     * Ensures consistent default state.
     */
    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = DocumentStatus.ACTIVE;
        }
        if (documentVersion == null) {
            documentVersion = 1;
        }
        if (aiProcessed == null) {
            aiProcessed = false;
        }
        if (storageType == null) {
            storageType = "LOCAL";
        }
        if (pdfExportAvailable == null) {
            pdfExportAvailable = false;
        }
        if (approvalStatus == null) {
            approvalStatus = ApprovalStatus.APPROVED;
        }
    }

    /**
     * Enum for Document status.
     * Supports soft-delete and archiving without data loss.
     */
    public enum DocumentStatus {
        ACTIVE,
        ARCHIVED,
        DELETED
    }
}