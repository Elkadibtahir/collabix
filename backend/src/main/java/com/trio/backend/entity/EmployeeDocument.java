package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.DocumentStatus;
import com.trio.backend.enums.EmployeeDocumentType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "hr_employee_documents",
        indexes = {
                @Index(name = "idx_hr_ed_employee_id", columnList = "employee_id"),
                @Index(name = "idx_hr_ed_type", columnList = "document_type"),
                @Index(name = "idx_hr_ed_employee_type", columnList = "employee_id, document_type"),
                @Index(name = "idx_hr_ed_status", columnList = "status"),
                @Index(name = "idx_hr_ed_expiration_date", columnList = "expiration_date"),
                @Index(name = "idx_hr_ed_uploaded_by", columnList = "uploaded_by"),
                @Index(name = "idx_hr_ed_verified", columnList = "verified"),
                @Index(name = "idx_hr_ed_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocument extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private EmployeeDocumentType documentType;

    @NotBlank
    @Size(max = 255)
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @NotBlank
    @Size(max = 255)
    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @NotBlank
    @Size(max = 255)
    @Column(name = "stored_file_name", nullable = false, length = 255)
    private String storedFileName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Size(max = 20)
    @Column(name = "file_extension", length = 20)
    private String fileExtension;

    @NotNull
    @Positive
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @NotBlank
    @Size(max = 500)
    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    @Size(max = 255)
    @Column(name = "checksum", length = 255)
    private String checksum;

    @Column(name = "uploaded_by")
    private UUID uploadedBy;

    @Column(name = "file_version", nullable = false)
    private Integer fileVersion;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "verified", nullable = false)
    private boolean verified;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DocumentStatus status;

    @Size(max = 1000)
    @Column(name = "description", length = 1000)
    private String description;

    @PrePersist
    private void prePersist() {
        if (fileVersion == null) {
            fileVersion = 1;
        }
        if (status == null) {
            status = DocumentStatus.ACTIVE;
        }
    }
}
