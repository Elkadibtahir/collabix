package com.trio.backend.dto.organisation.handover;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request to register an attachment on a HandoverEntry.
 */
@Getter
@Setter
public class CreateHandoverAttachmentRequest {

    @NotBlank(message = "File name is required")
    @Size(max = 255, message = "File name must not exceed 255 characters")
    private String fileName;

    private Long fileSize;

    @Size(max = 120, message = "Content type must not exceed 120 characters")
    private String contentType;

    @NotBlank(message = "Storage key is required")
    @Size(max = 500, message = "Storage key must not exceed 500 characters")
    private String storageKey;
}
