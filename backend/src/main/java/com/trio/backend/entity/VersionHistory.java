package com.trio.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "version_history",
        indexes = {
                @Index(name = "idx_vh_resource", columnList = "resource_type, resource_id"),
                @Index(name = "idx_vh_workspace", columnList = "workspace_id"),
                @Index(name = "idx_vh_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VersionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @NotBlank
    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;

    @NotNull
    @Column(name = "resource_id", nullable = false)
    private UUID resourceId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "storage_path", length = 500)
    private String storagePath;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
