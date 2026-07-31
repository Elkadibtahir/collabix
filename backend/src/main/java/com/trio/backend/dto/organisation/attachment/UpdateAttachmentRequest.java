package com.trio.backend.dto.organisation.attachment;

import com.trio.backend.entity.Attachment.AttachmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating an existing Attachment.
 *
 * <p>Supports status updates for soft-delete operations.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAttachmentRequest {

    /**
     * The new status of the attachment.
     * Can be ACTIVE or DELETED for soft-delete support.
     */
    private AttachmentStatus status;
}
