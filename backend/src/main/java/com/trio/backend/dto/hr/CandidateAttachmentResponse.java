package com.trio.backend.dto.hr;

import com.trio.backend.enums.AttachmentType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class CandidateAttachmentResponse {

    private UUID id;
    private UUID candidateId;
    private AttachmentType attachmentType;
    private String originalFileName;
    private String storedFileName;
    private String fileExtension;
    private String mimeType;
    private Long fileSize;
    private String storagePath;
    private String description;
    private UUID uploadedBy;
    private Integer fileVersion;
    private Instant createdAt;
    private Instant updatedAt;
}
