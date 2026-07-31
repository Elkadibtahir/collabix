package com.trio.backend.dto.hr;

import com.trio.backend.enums.AttachmentType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class AttachmentSearchCriteria {

    private UUID candidateId;
    private AttachmentType attachmentType;
    private UUID uploadedBy;
    private String fileExtension;
    private Instant dateFrom;
    private Instant dateTo;
    private String keyword;
}
