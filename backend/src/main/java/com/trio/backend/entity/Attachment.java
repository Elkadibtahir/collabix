package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.UUID;

/**
 * Attachment represents a file attached to a Task or optionally to a Comment.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>An Attachment belongs to exactly one Task (required).</li>
 *     <li>An Attachment may belong to one Comment (optional).</li>
 *     <li>Tenant isolation is ensured via the chain: Attachment -> Task -> Project -> ... -> Workspace.</li>
 *     <li>Designed for future reuse by Documents, Knowledge Base, Handover Journal, ATS without implementing relations now.</li>
 *     <li>Soft-delete status via AttachmentStatus enum.</li>
 *     <li>File metadata (name, size, MIME type, storage path) is stored for retrieval and validation.</li>
 * </ul>
 */
@Entity
@Table(
        name = "attachments",
        indexes = {
                @Index(name = "idx_attachments_task_id", columnList = "task_id"),
                @Index(name = "idx_attachments_comment_id", columnList = "comment_id"),
                @Index(name = "idx_attachments_status", columnList = "status"),
                @Index(name = "idx_attachments_created_at", columnList = "created_at"),
                @Index(name = "idx_attachments_task_status", columnList = "task_id, status")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attachment extends AuditableEntity {

    /**
     * The Task this attachment is associated with.
     * Required. Lazy loaded to optimize query performance.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    /**
     * The Comment this attachment is associated with.
     * Optional. If null, the attachment is tied only to the Task.
     * Lazy loaded to optimize query performance.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "comment_id", nullable = true)
    private Comment comment;

    /**
     * The original file name.
     * Required for user-facing reference and download operations.
     */
    @NotBlank(message = "File name is required")
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    /**
     * The MIME type of the file (e.g., "application/pdf", "image/jpeg").
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
     * The storage path or identifier for the file.
     * Could be a S3 key, cloud storage path, or local file system path.
     * Required for retrieval and deletion operations.
     */
    @NotBlank(message = "Storage path is required")
    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    /**
     * The status of the attachment (ACTIVE, DELETED).
     * Used for soft-delete support without removing data.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AttachmentStatus status = AttachmentStatus.ACTIVE;

    /**
     * Initialize status to ACTIVE if not set during entity creation.
     * Ensures consistent default state.
     */
    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = AttachmentStatus.ACTIVE;
        }
    }

    /**
     * Enum for Attachment status.
     * Supports soft-delete without data loss.
     */
    public enum AttachmentStatus {
        ACTIVE,
        DELETED
    }
}
