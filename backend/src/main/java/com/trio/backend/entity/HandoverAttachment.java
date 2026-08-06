package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

/**
 * Attachment attached to a {@link HandoverEntry}.
 *
 * <p>Stores file metadata only; the binary payload is stored externally
 * (see {@code storageKey}).</p>
 */
@Entity
@Table(
        name = "handover_attachments",
        indexes = {
                @Index(name = "idx_handover_attachments_entry", columnList = "handover_entry_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverAttachment extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "handover_entry_id", nullable = false)
    private HandoverEntry handoverEntry;

    @NotBlank
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize = 0L;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @NotBlank
    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "uploaded_by", nullable = true)
    private User uploadedBy;

    @PrePersist
    private void prePersist() {
        if (fileSize == null) {
            fileSize = 0L;
        }
    }
}
