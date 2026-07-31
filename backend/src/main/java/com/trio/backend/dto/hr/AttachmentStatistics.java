package com.trio.backend.dto.hr;

import com.trio.backend.enums.AttachmentType;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class AttachmentStatistics {

    private long totalAttachments;
    private long totalStorageBytes;
    private boolean hasCv;
    private long certificatesCount;
    private Map<AttachmentType, Long> attachmentsByType;
}
