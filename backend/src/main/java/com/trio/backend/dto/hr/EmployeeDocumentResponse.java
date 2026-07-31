package com.trio.backend.dto.hr;

import com.trio.backend.enums.DocumentStatus;
import com.trio.backend.enums.EmployeeDocumentType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class EmployeeDocumentResponse {

    private UUID id;
    private UUID employeeId;
    private EmployeeDocumentType documentType;
    private String title;
    private String originalFileName;
    private String storedFileName;
    private String mimeType;
    private String fileExtension;
    private Long fileSize;
    private String storagePath;
    private String checksum;
    private UUID uploadedBy;
    private Integer fileVersion;
    private LocalDate expirationDate;
    private boolean verified;
    private UUID verifiedBy;
    private Instant verifiedAt;
    private DocumentStatus status;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
}
